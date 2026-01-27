--------------------------------
# roles
--------------------------------
CREATE TABLE roles (
    role_id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role_name  VARCHAR(60) NOT NULL UNIQUE, -- e.g., 'Admin', 'Manager', 'User'
    permissions JSONB NOT NULL
);
-- TODO: Define permissions structure
INSERT INTO roles (role_name, permissions) VALUES
('Admin',   '{}'::jsonb),
('Manager', '{}'::jsonb),
('User',    '{}'::jsonb);
--------------------------------
# users
--------------------------------
-- table to store users of the CRM system
CREATE TABLE users (
    user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    -- Business identifier (για UI)
    user_code VARCHAR(20)
        GENERATED ALWAYS AS ('U' || lpad(user_id::text, 4, '0')) STORED,

    first_name VARCHAR(100) NOT NULL,
    last_name  VARCHAR(100) NOT NULL,

    username VARCHAR(80)  NOT NULL,
    email    VARCHAR(255) NOT NULL,

    password_hash TEXT NOT NULL,

    mobile_phone VARCHAR(30) NULL,

    role_id BIGINT NOT NULL,

    status VARCHAR(30) NOT NULL, -- ONLINE, OFFLINE, ONBREAK, MEETING, etc

    last_login_at TIMESTAMP NULL,

    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),

    is_active BOOLEAN NOT NULL DEFAULT true, -- soft delete flag

    -- Constraints
    CONSTRAINT uq_users_user_code UNIQUE (user_code),
    CONSTRAINT uq_users_username  UNIQUE (username),
    CONSTRAINT uq_users_email     UNIQUE (email),

    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- function to insert a new user in web application
CREATE OR REPLACE FUNCTION insert_user(
    p_first_name    VARCHAR,
    p_last_name     VARCHAR,
    p_username      VARCHAR,
    p_email         VARCHAR,
    p_password_hash TEXT,
    p_role_id       BIGINT,
    p_mobile_phone  VARCHAR DEFAULT NULL,
    p_status        VARCHAR DEFAULT 'OFFLINE'
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_id BIGINT;
BEGIN
    INSERT INTO users (
        first_name,
        last_name,
        username,
        email,
        password_hash,
        mobile_phone,
        role_id,
        status,
        is_active
    )
    VALUES (
        trim(p_first_name),
        trim(p_last_name),
        trim(p_username),
        trim(p_email),
        p_password_hash,
        NULLIF(trim(p_mobile_phone), ''),
        p_role_id,
        COALESCE(p_status, 'OFFLINE'),
        true
    )
    RETURNING user_id INTO v_user_id;

    RETURN v_user_id;
END;
$$;

-- function to update an existing user
CREATE OR REPLACE FUNCTION update_user(
    p_user_id      BIGINT,
    p_first_name   VARCHAR,
    p_last_name    VARCHAR,
    p_email        VARCHAR,
    p_role_id      BIGINT,
    p_mobile_phone VARCHAR DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE users
    SET
        first_name   = trim(p_first_name),
        last_name    = trim(p_last_name),
        email        = trim(p_email),
        mobile_phone = NULLIF(trim(p_mobile_phone), ''),
        role_id      = p_role_id,
        updated_at   = now()
    WHERE user_id = p_user_id
      AND is_active = true;

    RETURN FOUND;
END;
$$;

-- function to soft delete a user by setting is_active to false
CREATE OR REPLACE FUNCTION soft_delete_user(p_user_id BIGINT)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE users
    SET is_active = false,
        updated_at = now()
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found: %', p_user_id;
    END IF;
END;
$$;

-- function to authenticate a user during login (UI: login form)
CREATE OR REPLACE FUNCTION login_user(
    p_username      VARCHAR,
    p_password_hash TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_id BIGINT;
BEGIN
    --Check user existence
    SELECT user_id
      INTO v_user_id
    FROM users
    WHERE username = p_username
      AND is_active = true;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User does not exist or is inactive.';
    END IF;

    --Check correct password
    IF NOT EXISTS (
        SELECT 1
        FROM users
        WHERE user_id = v_user_id
          AND password_hash = p_password_hash
    ) THEN
        RAISE EXCEPTION 'Invalid password.';
    END IF;

    --Successful login
    UPDATE users
    SET last_login_at = now()
    WHERE user_id = v_user_id;

    RETURN TRUE;
END;
$$;

--------------------------------
# traders 
--------------------------------
CREATE TABLE traders (
    trader_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    trader_code VARCHAR(20) NOT NULL, -- C0001 / S0001
    type VARCHAR(20) NOT NULL CHECK (type IN ('CLIENT','SUPPLIER')),

    status BOOLEAN NOT NULL DEFAULT true, -- TRUE = ACTIVE / FALSE = INACTIVE

    company_name VARCHAR(200) NOT NULL,
    account_type VARCHAR(50) NULL,
    tim_number VARCHAR(20) NOT NULL,
    language VARCHAR(10) NULL, -- el / en

    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255) NOT NULL,

    address TEXT NOT NULL,
    city VARCHAR(120) NULL,
    state_country VARCHAR(100) NULL,
    zip_code VARCHAR(20) NULL,

    created_by_user_id BIGINT NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT uq_traders_code UNIQUE (trader_code),
    CONSTRAINT uq_traders_tim UNIQUE (tim_number),

    CONSTRAINT fk_traders_created_by
        FOREIGN KEY (created_by_user_id) REFERENCES users(user_id)
);

-- sequences for trader codes
CREATE SEQUENCE traders_client_code_seq START 1;
CREATE SEQUENCE traders_supplier_code_seq START 1;

-- function to insert a new client
CREATE OR REPLACE FUNCTION insert_client(
    p_company_name       VARCHAR,
    p_account_type       VARCHAR,
    p_tim_number         VARCHAR,
    p_language           VARCHAR,
    p_phone              VARCHAR,
    p_email              VARCHAR,
    p_address            TEXT,
    p_city               VARCHAR DEFAULT NULL,
    p_state_country      VARCHAR DEFAULT NULL,
    p_zip_code           VARCHAR DEFAULT NULL,
    p_created_by_user_id BIGINT
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_trader_id BIGINT;
    v_num BIGINT;
    v_code VARCHAR(20);
BEGIN
    v_num  := nextval('traders_client_code_seq');
    v_code := 'C' || lpad(v_num::text, 4, '0');

    INSERT INTO traders (
        trader_code, type, status,
        company_name, account_type, tim_number, language,
        phone, email, address, city, state_country, zip_code,
        created_by_user_id
    )
    VALUES (
        v_code, 'CLIENT', true,
        trim(p_company_name), p_account_type, trim(p_tim_number), p_language,
        trim(p_phone), trim(p_email), p_address, p_city, p_state_country, p_zip_code,
        p_created_by_user_id
    )
    RETURNING trader_id INTO v_trader_id;

    RETURN v_trader_id;
END;
$$;

-- function to update an existing trader
CREATE OR REPLACE FUNCTION update_trader(
    p_trader_id          BIGINT,

    p_company_name       VARCHAR,
    p_tim_number         VARCHAR,
    p_phone              VARCHAR,
    p_email              VARCHAR,

    p_address            TEXT,
    p_city               VARCHAR DEFAULT NULL,
    p_state_country      VARCHAR DEFAULT NULL,
    p_zip_code           VARCHAR DEFAULT NULL,
    p_language           VARCHAR DEFAULT NULL,
    p_account_type       VARCHAR DEFAULT NULL,
    p_status             BOOLEAN DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE traders
    SET
        company_name  = trim(p_company_name),
        tim_number    = trim(p_tim_number),
        phone         = trim(p_phone),
        email         = trim(p_email),

        -- address είναι NOT NULL στον πίνακα, άρα δεν επιτρέπουμε να γίνει NULL
        address       = p_address,

        city          = NULLIF(trim(p_city), ''),
        state_country = NULLIF(trim(p_state_country), ''),
        zip_code      = NULLIF(trim(p_zip_code), ''),

        language      = NULLIF(trim(p_language), ''),
        account_type  = NULLIF(trim(p_account_type), ''),

        -- αν δεν σταλεί status, κράτα το παλιό
        status        = COALESCE(p_status, status),

        updated_at    = now()
    WHERE trader_id = p_trader_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Trader not found: %', p_trader_id;
    END IF;
END;
$$;

-- function to delete a trader
CREATE OR REPLACE FUNCTION delete_trader(p_trader_id BIGINT)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM traders
    WHERE trader_id = p_trader_id;

    -- Αν δεν διαγράφηκε καμία γραμμή → δεν υπάρχει trader
    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Trader with id % does not exist',
            p_trader_id
            USING ERRCODE = 'P0001';
    END IF;

EXCEPTION
    -- FK violation (π.χ. υπάρχει task που αναφέρεται στον trader)
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION
            'Cannot delete trader with id %. Related records exist.',
            p_trader_id
            USING ERRCODE = '23503';
END;
$$;

-- function to get all active clients (UI: clients list)
CREATE OR REPLACE FUNCTION get_all_active_clients()
RETURNS TABLE (
    trader_id        BIGINT,
    trader_code      VARCHAR,
    company_name     VARCHAR,
    account_type     VARCHAR,
    tim_number       VARCHAR,
    language         VARCHAR,
    phone            VARCHAR,
    email            VARCHAR,
    address          TEXT,
    city             VARCHAR,
    state_country    VARCHAR,
    zip_code         VARCHAR,
    created_at       TIMESTAMP,
    updated_at       TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.trader_id,
        t.trader_code,
        t.company_name,
        t.account_type,
        t.tim_number,
        t.language,
        t.phone,
        t.email,
        t.address,
        t.city,
        t.state_country,
        t.zip_code,
        t.created_at,
        t.updated_at
    FROM traders t
    WHERE t.type = 'CLIENT'
      AND t.status = true
    ORDER BY t.company_name;
END;
$$;

-- function to get client statistics (UI: statistics on clients widget)
CREATE OR REPLACE FUNCTION get_client_stats()
RETURNS TABLE (
    total_clients    BIGINT,
    active_clients   BIGINT,
    inactive_clients BIGINT
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        COUNT(*) FILTER (WHERE t.type = 'CLIENT')                                              AS total_clients,
        COUNT(*) FILTER (WHERE t.type = 'CLIENT' AND t.status = true)                           AS active_clients,
        COUNT(*) FILTER (WHERE t.type = 'CLIENT' AND t.status = false)                          AS inactive_clients
    FROM traders t;
$$;

-- function to filter clients list with search bar + filtered list (UI: search bar)
CREATE OR REPLACE FUNCTION filter_clients_with_search(
    p_search        TEXT DEFAULT NULL,     -- search bar

    p_code_prefix   TEXT DEFAULT NULL,     -- C000*
    p_name_prefix   TEXT DEFAULT NULL,     -- Name*
    p_tim_prefix    TEXT DEFAULT NULL,     -- TIM*
    p_email_prefix  TEXT DEFAULT NULL,     -- Email*
    p_phone_prefix  TEXT DEFAULT NULL,     -- Phone*
    p_status        VARCHAR DEFAULT 'ALL', -- 'ACTIVE' | 'INACTIVE' | 'ALL'

    p_limit         INTEGER DEFAULT 50,
    p_offset        INTEGER DEFAULT 0
)
RETURNS TABLE (
    trader_id       BIGINT,
    trader_code     VARCHAR,
    company_name    VARCHAR,
    tim_number      VARCHAR,
    phone           VARCHAR,
    email           VARCHAR,
    status          BOOLEAN,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_search TEXT;
    v_is_numeric BOOLEAN;
BEGIN
    v_search := NULLIF(trim(p_search), '');
    v_is_numeric := (v_search IS NOT NULL AND v_search ~ '^[0-9]+$');

    RETURN QUERY
    SELECT
        t.trader_id,
        t.trader_code,
        t.company_name,
        t.tim_number,
        t.phone,
        t.email,
        t.status,
        t.created_at,
        t.updated_at
    FROM traders t
    WHERE t.type = 'CLIENT'

      -- STATUS (dropdown)
      AND (
            p_status = 'ALL'
            OR (p_status = 'ACTIVE'   AND t.status = true)
            OR (p_status = 'INACTIVE' AND t.status = false)
          )

      -- FILTERS (φόρμα)
      AND (p_code_prefix  IS NULL OR p_code_prefix  = '' OR t.trader_code   ILIKE p_code_prefix  || '%')
      AND (p_name_prefix  IS NULL OR p_name_prefix  = '' OR t.company_name  ILIKE p_name_prefix  || '%')
      AND (p_tim_prefix   IS NULL OR p_tim_prefix   = '' OR t.tim_number    ILIKE p_tim_prefix   || '%')
      AND (p_email_prefix IS NULL OR p_email_prefix = '' OR t.email         ILIKE p_email_prefix || '%')
      AND (p_phone_prefix IS NULL OR p_phone_prefix = '' OR t.phone         ILIKE p_phone_prefix || '%')

      -- SEARCH BAR (πάνω στο ΦΙΛΤΡΑΡΙΣΜΕΝΟ result)
      AND (
            v_search IS NULL
            OR (
                v_is_numeric
                AND t.trader_id::text LIKE v_search || '%'
            )
            OR (
                NOT v_is_numeric
                AND (
                    t.company_name ILIKE v_search || '%'
                    OR t.trader_code ILIKE v_search || '%'
                )
            )
          )

    ORDER BY t.company_name
    LIMIT p_limit OFFSET p_offset;
END;
$$;

-- function to filter clients with multiple criteria (UI: filter clients form)
CREATE OR REPLACE FUNCTION filter_clients(
    p_code_prefix   TEXT DEFAULT NULL,     -- Id field: C000*
    p_name_prefix   TEXT DEFAULT NULL,     -- Name
    p_tim_prefix    TEXT DEFAULT NULL,     -- TIM
    p_email_prefix  TEXT DEFAULT NULL,     -- Email Address
    p_phone_prefix  TEXT DEFAULT NULL,     -- Phone Number
    p_status        VARCHAR DEFAULT 'ALL', -- 'ACTIVE' | 'INACTIVE' | 'ALL'
    p_limit         INTEGER DEFAULT 50,
    p_offset        INTEGER DEFAULT 0
)
RETURNS TABLE (
    trader_id       BIGINT,
    trader_code     VARCHAR,
    company_name    VARCHAR,
    tim_number      VARCHAR,
    phone           VARCHAR,
    email           VARCHAR,
    status          BOOLEAN,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.trader_id,
        t.trader_code,
        t.company_name,
        t.tim_number,
        t.phone,
        t.email,
        t.status,
        t.created_at,
        t.updated_at
    FROM traders t
    WHERE t.type = 'CLIENT'

      -- STATUS (dropdown)
      AND (
            p_status = 'ALL'
            OR (p_status = 'ACTIVE'   AND t.status = true)
            OR (p_status = 'INACTIVE' AND t.status = false)
          )

      -- Id (trader_code) prefix: something*
      AND (
            p_code_prefix IS NULL OR p_code_prefix = ''
            OR t.trader_code ILIKE p_code_prefix || '%'
          )

      -- Name prefix: something*
      AND (
            p_name_prefix IS NULL OR p_name_prefix = ''
            OR t.company_name ILIKE p_name_prefix || '%'
          )

      -- TIM prefix: something*
      AND (
            p_tim_prefix IS NULL OR p_tim_prefix = ''
            OR t.tim_number ILIKE p_tim_prefix || '%'
          )

      -- Email prefix: something*
      AND (
            p_email_prefix IS NULL OR p_email_prefix = ''
            OR t.email ILIKE p_email_prefix || '%'
          )

      -- Phone prefix: something*
      AND (
            p_phone_prefix IS NULL OR p_phone_prefix = ''
            OR t.phone ILIKE p_phone_prefix || '%'
          )

    ORDER BY t.company_name
    LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Indexes to optimize client filtering
CREATE INDEX idx_traders_clients_active
ON traders (status)
WHERE type = 'CLIENT';

CREATE INDEX idx_traders_clients_code_prefix
ON traders (trader_code text_pattern_ops)
WHERE type = 'CLIENT';

CREATE INDEX idx_traders_clients_name_prefix
ON traders (company_name text_pattern_ops)
WHERE type = 'CLIENT';

CREATE INDEX idx_traders_clients_tim_prefix
ON traders (tim_number text_pattern_ops)
WHERE type = 'CLIENT';

CREATE INDEX idx_traders_clients_email_prefix
ON traders (email text_pattern_ops)
WHERE type = 'CLIENT';

CREATE INDEX idx_traders_clients_phone_prefix
ON traders (phone text_pattern_ops)
WHERE type = 'CLIENT';

--------------------------------
# tasks
--------------------------------
CREATE TABLE task_type (
    task_type_id   INTEGER PRIMARY KEY, -- manually assigned IDs to maintain consistency across different environments
    task_type_name VARCHAR(100) NOT NULL,
    task_type_code VARCHAR(5) NOT NULL, -- e.g., 'CL' for Call, 'EM' for Email, 'IN' for In-office, 'OUT' for Out-of-office
    is_active      BOOLEAN NOT NULL DEFAULT true, --I will show only active task types in the UI (every company can have its own set of task types)

    CONSTRAINT uq_task_type_name UNIQUE (task_type_name),
    CONSTRAINT uq_task_type_code UNIQUE (task_type_code)
);

INSERT INTO task_type (task_type_id, task_type_name, task_type_code) VALUES
(1001, 'Call', 'CL'),
(1002, 'Email', 'EM'),
(1003, 'Work on office', 'IN'),
(1004, 'Field work', 'OUT');

-- function to insert a new task type
CREATE OR REPLACE FUNCTION insert_task_type(
    p_task_type_id   integer,
    p_task_type_name varchar,
    p_task_type_code varchar,
    p_is_active      boolean DEFAULT true
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO task_type (
        task_type_id,
        task_type_name,
        task_type_code,
        is_active
    )
    VALUES (
        p_task_type_id,
        p_task_type_name,
        p_task_type_code,
        p_is_active
    );
END;
$$;

-- function to set active task types
-- UI: this method will be used in the settings page (handle tasks) when the button "Update" is clicked
CREATE OR REPLACE FUNCTION set_active_task_types(
    p_active_task_type_ids integer[]
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE task_type
    SET is_active = (task_type_id = ANY(COALESCE(p_active_task_type_ids, ARRAY[]::integer[])));
END;
$$;

# tasks entries table
CREATE TABLE tasks (
    task_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    task_type_id INTEGER NOT NULL,      -- FK -> task_type(task_type_id)

    task_prefix  INTEGER NULL,          -- filled by trigger (sequential per task_type_id)
    chain_id     BIGINT NULL,           -- task chain for history activity

    transaction_id BIGINT NOT NULL,     -- FK -> traders(trader_id)

    status VARCHAR(30) NOT NULL,        -- IN_PROGRESS, COMPLETED, CANCELLED

    handled_by_user_id  BIGINT NOT NULL, -- FK -> users(user_id)
    assigned_to_user_id BIGINT NULL,     -- FK -> users(user_id)

    subject       VARCHAR(200) NOT NULL,
    description   TEXT NOT NULL,

    priority VARCHAR(30) NULL,          -- LOW, MEDIUM, HIGH
    reminder BOOLEAN NOT NULL DEFAULT false,

    call_duration_seconds INTEGER NULL,
    location TEXT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),

    -- Prefix must exist and be >= 1 (trigger will set it before insert)
    CONSTRAINT ck_tasks_task_prefix_ge_1
        CHECK (task_prefix IS NOT NULL AND task_prefix >= 1),

    CONSTRAINT uq_tasks_type_prefix UNIQUE (task_type_id, task_prefix),

    CONSTRAINT fk_tasks_type
        FOREIGN KEY (task_type_id) REFERENCES task_type(task_type_id),

    CONSTRAINT fk_tasks_chain
        FOREIGN KEY (chain_id) REFERENCES tasks(task_id),

    CONSTRAINT fk_tasks_trader
        FOREIGN KEY (transaction_id) REFERENCES traders(trader_id),

    CONSTRAINT fk_tasks_handled_by
        FOREIGN KEY (handled_by_user_id) REFERENCES users(user_id),

    CONSTRAINT fk_tasks_assigned_to
        FOREIGN KEY (assigned_to_user_id) REFERENCES users(user_id)
);

-- no endpoint
-- function to hadle task_prefix generation in order to have its own sequence for each task type
CREATE OR REPLACE FUNCTION next_task_prefix(p_task_type_id integer)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
    v_next integer;
BEGIN
    IF p_task_type_id IS NULL THEN
        RAISE EXCEPTION 'task_type_id cannot be NULL';
    END IF;

    -- κλειδώνει ΜΟΝΟ για αυτό το task_type_id μέσα στο transaction (namespaced key)
    PERFORM pg_advisory_xact_lock(100000::bigint + p_task_type_id::bigint);

    SELECT COALESCE(MAX(t.task_prefix), 0) + 1
      INTO v_next
      FROM tasks t
     WHERE t.task_type_id = p_task_type_id
       AND t.task_prefix IS NOT NULL;

    RETURN v_next;
END;
$$;

-- no endpoint
-- function to get the full task code (e.g., CL0001) for a given task_id
CREATE OR REPLACE FUNCTION task_code(p_task_id BIGINT)
RETURNS VARCHAR
LANGUAGE sql
STABLE
AS $$
    SELECT
        tt.task_type_code || lpad(t.task_prefix::text, 4, '0')
    FROM tasks t
    JOIN task_type tt ON tt.task_type_id = t.task_type_id
    WHERE t.task_id = p_task_id;
$$;

-- no endpoint
-- function to have mandatory location for OUT tasks
CREATE OR REPLACE FUNCTION tasks_location_rule(
    p_task_type_id integer,
    p_location text
)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    v_type_code varchar(5);
BEGIN
    SELECT task_type_code
      INTO v_type_code
      FROM task_type
     WHERE task_type_id = p_task_type_id;

    IF v_type_code IS NULL THEN
        RAISE EXCEPTION 'Invalid task_type_id: %', p_task_type_id;
    END IF;

    IF v_type_code = 'OUT' THEN
        IF p_location IS NULL OR btrim(p_location) = '' THEN
            RAISE EXCEPTION 'Location is required for OUT tasks.';
        END IF;
        RETURN p_location;
    END IF;

    -- non-OUT: keep data clean
    RETURN NULL;
END;
$$;

-- function to insert a new task
CREATE OR REPLACE FUNCTION insert_task(
    p_task_type_id          integer,
    p_transaction_id        bigint,
    p_status                varchar,
    p_handled_by_user_id    bigint,
    p_subject               varchar,
    p_description           text,               

    p_assigned_to_user_id   bigint DEFAULT NULL,
    p_priority              varchar DEFAULT NULL,
    p_reminder              boolean DEFAULT false,

    p_call_duration_seconds integer DEFAULT NULL,
    p_location              text DEFAULT NULL,

    p_chain_id              bigint DEFAULT NULL
)
RETURNS TABLE (task_id bigint, task_prefix integer)
LANGUAGE plpgsql
AS $$
DECLARE
    v_location text;
BEGIN
    v_location := tasks_location_rule(p_task_type_id, p_location);

    INSERT INTO tasks (
        task_type_id,
        task_prefix,          -- αφήνουμε NULL -> trigger το γεμίζει
        chain_id,
        transaction_id,
        status,
        handled_by_user_id,
        assigned_to_user_id,
        subject,
        description,
        priority,
        reminder,
        call_duration_seconds,
        location
    )
    VALUES (
        p_task_type_id,
        NULL,
        p_chain_id,
        p_transaction_id,
        p_status,
        p_handled_by_user_id,
        p_assigned_to_user_id,
        p_subject,
        p_description,
        p_priority,
        p_reminder,
        p_call_duration_seconds,
        v_location
    )
    RETURNING tasks.task_id, tasks.task_prefix
    INTO task_id, task_prefix;

    RETURN;
END;
$$;

-- function to update an existing task
CREATE OR REPLACE FUNCTION update_task(
    p_task_id               bigint,
    p_status                varchar,
    p_subject               varchar,
    p_description           text,      
    p_assigned_to_user_id   bigint DEFAULT NULL,
    p_priority              varchar DEFAULT NULL,
    p_reminder              boolean DEFAULT false,
    p_call_duration_seconds integer DEFAULT NULL,
    p_location              text DEFAULT NULL
)
RETURNS TABLE (task_id bigint, task_prefix integer)
LANGUAGE plpgsql
AS $$
DECLARE
    v_task_type_id integer;
    v_location     text;
BEGIN
    SELECT t.task_type_id
      INTO v_task_type_id
      FROM tasks t
     WHERE t.task_id = p_task_id;

    IF v_task_type_id IS NULL THEN
        RAISE EXCEPTION 'Task with id % does not exist', p_task_id
        USING ERRCODE = 'P0001';
    END IF;

    IF p_assigned_to_user_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM users u WHERE u.user_id = p_assigned_to_user_id
        ) THEN
            RAISE EXCEPTION 'User with id % does not exist', p_assigned_to_user_id
            USING ERRCODE = 'P0001';
        END IF;
    END IF;

    v_location := tasks_location_rule(v_task_type_id, p_location);

    UPDATE tasks t
       SET status                = p_status,
           subject               = p_subject,
           description           = p_description,
           assigned_to_user_id   = p_assigned_to_user_id,
           priority              = p_priority,
           reminder              = p_reminder,
           call_duration_seconds = p_call_duration_seconds,
           location              = v_location,
           updated_at            = now()
     WHERE t.task_id = p_task_id
     RETURNING t.task_id, t.task_prefix
      INTO task_id, task_prefix;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Task not found: %', p_task_id;
    END IF;

    RETURN;
END;
$$;

-- no endpoint
-- trigger to enforce location rule on tasks table
CREATE OR REPLACE FUNCTION trg_tasks_location_not_null_for_out()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- OUT required, else NULL
    NEW.location := tasks_location_rule(NEW.task_type_id, NEW.location);
    RETURN NEW;
END;
$$;

CREATE TRIGGER biu_tasks_location_not_null_for_out
BEFORE INSERT OR UPDATE OF task_type_id, location ON tasks
FOR EACH ROW
EXECUTE FUNCTION trg_tasks_location_not_null_for_out();

-- trigger to auto-fill task_prefix on insert
CREATE OR REPLACE FUNCTION trg_tasks_fill_prefix()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.task_prefix IS NULL THEN
        NEW.task_prefix := next_task_prefix(NEW.task_type_id);
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER bi_tasks_fill_prefix
BEFORE INSERT ON tasks
FOR EACH ROW
EXECUTE FUNCTION trg_tasks_fill_prefix();


-- table to store comments for tasks
CREATE TABLE task_comments (
    comment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    task_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,

    comment TEXT NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT fk_task_comments_task
        FOREIGN KEY (task_id)
        REFERENCES tasks(task_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_task_comments_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
);

-- function to insert a comment for a specific task
CREATE OR REPLACE FUNCTION add_task_comment(
    p_task_id BIGINT,
    p_user_id BIGINT,
    p_comment TEXT
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_comment_id BIGINT;
BEGIN
    -- Αν το σχόλιο είναι κενό, δεν κάνουμε τίποτα
    IF p_comment IS NULL OR btrim(p_comment) = '' THEN
        RETURN NULL;
    END IF;

    -- Αν δεν υπάρχει task -> ΣΦΑΛΜΑ
    IF NOT EXISTS (
        SELECT 1 FROM tasks WHERE task_id = p_task_id
    ) THEN
        RAISE EXCEPTION
            'Task with id % does not exist',
            p_task_id
            USING ERRCODE = 'P0001';
    END IF;

    -- Αν δεν υπάρχει user -> ΣΦΑΛΜΑ
    IF NOT EXISTS (
        SELECT 1 FROM users WHERE user_id = p_user_id
    ) THEN
        RAISE EXCEPTION
            'User with id % does not exist',
            p_user_id
            USING ERRCODE = 'P0001';
    END IF;

    -- Insert σχολίου
    INSERT INTO task_comments (task_id, user_id, comment)
    VALUES (p_task_id, p_user_id, btrim(p_comment))
    RETURNING comment_id INTO v_comment_id;

    -- Update του task για activity tracking
    UPDATE tasks
    SET updated_at = now()
    WHERE task_id = p_task_id;

    RETURN v_comment_id;
END;
$$;

-- function to get comments for a specific task
CREATE OR REPLACE FUNCTION get_task_comments(p_task_id BIGINT)
RETURNS TABLE (
    comment_id BIGINT,
    created_at TIMESTAMP,
    left_text  TEXT,
    right_text TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        tc.comment_id,
        tc.created_at,

        -- Αριστερά: ημερομηνία: comment
        to_char(tc.created_at, 'DD/MM/YYYY')
            || ': '
            || tc.comment
            AS left_text,

        -- Δεξιά: | user_id: user_name
        '| '
        || tc.user_id
        || ': '
        || u.first_name
            AS right_text

    FROM task_comments tc
    JOIN users u ON u.user_id = tc.user_id
    WHERE tc.task_id = p_task_id
    ORDER BY tc.created_at ASC;
END;
$$;

-- IMPORTANT (UI / DAO INSTRUCTIONS)
-- Flow that MUST be followed:
--
-- 1) Call get_task_transform_prefill(source_task_id, new_task_type_id)
--    to prefill the new task form.
--
-- 2) Store the returned chain_id in the UI (hidden field or form state).
--
-- 3) When the user presses "Save", call insert_task(...)
--    and pass the stored chain_id as p_chain_id.
--
-- function to prefill data for transforming a task to a new type
-- SKIP
CREATE OR REPLACE FUNCTION get_task_transform_prefill(
    p_source_task_id bigint,
    p_new_task_type_id integer
)
RETURNS TABLE (
    chain_id bigint,
    transaction_id bigint,
    subject varchar,
    description text,
    priority varchar,
    reminder boolean,
    call_duration_seconds integer,
    location text
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_old tasks%ROWTYPE;
BEGIN
    -- 1) Το source task πρέπει να υπάρχει
    SELECT *
      INTO v_old
      FROM tasks
     WHERE task_id = p_source_task_id;

    IF v_old.task_id IS NULL THEN
        RAISE EXCEPTION 'Task with id % does not exist', p_source_task_id
        USING ERRCODE = 'P0001';
    END IF;

    -- 2) Το νέο task type πρέπει να υπάρχει
    IF NOT EXISTS (
        SELECT 1 FROM task_type WHERE task_type_id = p_new_task_type_id
    ) THEN
        RAISE EXCEPTION 'Task type with id % does not exist', p_new_task_type_id
        USING ERRCODE = 'P0001';
    END IF;

    -- 3) Δεν επιτρέπεται transform στο ίδιο type
    IF v_old.task_type_id = p_new_task_type_id THEN
        RAISE EXCEPTION
            'Task % is already of task_type_id %',
            p_source_task_id,
            p_new_task_type_id
            USING ERRCODE = 'P0001';
    END IF;

    -- 4) Root chain (αν είναι root -> το ίδιο, αλλιώς το chain_id)
    chain_id := COALESCE(v_old.chain_id, v_old.task_id);

    -- 5) Prefill πεδία για τη νέα φόρμα
    transaction_id := v_old.transaction_id;
    subject := v_old.subject;
    description := v_old.description;
    priority := v_old.priority;
    reminder := v_old.reminder;
    call_duration_seconds := v_old.call_duration_seconds;

    -- Σημείωση:
    -- Το OUT rule ΔΕΝ εφαρμόζεται εδώ.
    -- Θα εφαρμοστεί στην insert_task (function + trigger).
    location := v_old.location;

    RETURN NEXT;
END;
$$;

-- function to get all unassigned tasks with status IN_PROGRESS (UI: unassigned tasks list)
CREATE OR REPLACE FUNCTION get_unassigned_tasks()
RETURNS TABLE (
    task_id BIGINT,
    task_type_id INTEGER,
    task_prefix INTEGER,
    chain_id BIGINT,
    transaction_id BIGINT,
    status VARCHAR,
    handled_by_user_id BIGINT,
    subject VARCHAR,
    description TEXT,
    priority VARCHAR,
    reminder BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.task_id,
        t.task_type_id,
        t.task_prefix,
        t.chain_id,
        t.transaction_id,
        t.status,
        t.handled_by_user_id,
        t.subject,
        t.description,
        t.priority,
        t.reminder,
        t.created_at,
        t.updated_at
    FROM tasks t
    WHERE t.status = 'IN_PROGRESS'
      AND t.assigned_to_user_id IS NULL
    ORDER BY t.created_at DESC; 
END;
$$;

-- function to get all tasks assigned to a specific user with status IN_PROGRESS (UI: my tasks list)
CREATE OR REPLACE FUNCTION get_my_tasks(
    p_user_id BIGINT
)
RETURNS TABLE (
    task_id BIGINT,
    task_type_id INTEGER,
    task_prefix INTEGER,
    chain_id BIGINT,
    transaction_id BIGINT,
    status VARCHAR,
    handled_by_user_id BIGINT,
    assigned_to_user_id BIGINT,
    subject VARCHAR,
    description TEXT,
    priority VARCHAR,
    reminder BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.task_id,
        t.task_type_id,
        t.task_prefix,
        t.chain_id,
        t.transaction_id,
        t.status,
        t.handled_by_user_id,
        t.assigned_to_user_id,
        t.subject,
        t.description,
        t.priority,
        t.reminder,
        t.created_at,
        t.updated_at
    FROM tasks t
    WHERE t.status = 'IN_PROGRESS'
      AND t.assigned_to_user_id = p_user_id
    ORDER BY t.created_at DESC; 
END;
$$;

-- function to filter tasks (UI: filter tasks form)
CREATE OR REPLACE FUNCTION filter_tasks(
    p_task_id            BIGINT  DEFAULT NULL,   -- Task Id (exact)
    p_task_type_id       INTEGER DEFAULT NULL,   -- dropdown
    p_date_from          DATE    DEFAULT NULL,   -- date period start
    p_date_to            DATE    DEFAULT NULL,   -- date period end
    p_priority           VARCHAR DEFAULT NULL,   -- LOW | MEDIUM | HIGH
    p_status             VARCHAR DEFAULT NULL,   -- IN_PROGRESS | COMPLETED | CANCELLED

    -- Client details (prefix like something*)
    p_client_code_prefix  TEXT DEFAULT NULL,     -- e.g. 'C000'
    p_client_name_prefix  TEXT DEFAULT NULL,     -- name prefix
    p_client_tim_prefix   TEXT DEFAULT NULL,     -- TIM prefix
    p_client_email_prefix TEXT DEFAULT NULL      -- email prefix
)
RETURNS TABLE (
    task_id BIGINT,
    task_type_id INTEGER,
    task_prefix INTEGER,
    chain_id BIGINT,
    transaction_id BIGINT,
    status VARCHAR,
    handled_by_user_id BIGINT,
    assigned_to_user_id BIGINT,
    subject VARCHAR,
    description TEXT,
    priority VARCHAR,
    reminder BOOLEAN,
    call_duration_seconds INTEGER,
    location TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    trader_code VARCHAR,
    trader_name VARCHAR,
    trader_tim  VARCHAR,
    trader_email VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.task_id,
        t.task_type_id,
        t.task_prefix,
        t.chain_id,
        t.transaction_id,
        t.status,
        t.handled_by_user_id,
        t.assigned_to_user_id,
        t.subject,
        t.description,
        t.priority,
        t.reminder,
        t.call_duration_seconds,
        t.location,
        t.created_at,
        t.updated_at,

        tr.trader_code,
        tr.company_name,
        tr.tim_number,
        tr.email
    FROM tasks t
    JOIN traders tr
      ON tr.trader_id = t.transaction_id
    WHERE
        -- Task Id
        (p_task_id IS NULL OR t.task_id = p_task_id)

        -- Task Type
        AND (p_task_type_id IS NULL OR t.task_type_id = p_task_type_id)

        -- Status
        AND (p_status IS NULL OR t.status = p_status)

        -- Priority
        AND (p_priority IS NULL OR t.priority = p_priority)

        -- Date Period (πάνω στο created_at)
        AND (p_date_from IS NULL OR t.created_at::date >= p_date_from)
        AND (p_date_to   IS NULL OR t.created_at::date <= p_date_to)

        -- Client Details (prefix like something*)
        AND (p_client_code_prefix  IS NULL OR tr.trader_code ILIKE p_client_code_prefix || '%')
        AND (p_client_name_prefix  IS NULL OR tr.company_name        ILIKE p_client_name_prefix || '%')
        AND (p_client_tim_prefix   IS NULL OR tr.tim_number         ILIKE p_client_tim_prefix || '%')
        AND (p_client_email_prefix IS NULL OR tr.email       ILIKE p_client_email_prefix || '%')

    ORDER BY t.created_at DESC; -- νεότερα πρώτα
END;
$$;

-- function to filter tasks with search bar based on filtered results 
CREATE OR REPLACE FUNCTION filter_tasks_with_search(
    p_scope TEXT DEFAULT 'ALL',          -- 'ALL' | 'UNASSIGNED' | 'MY'
    p_user_id BIGINT DEFAULT NULL,       -- required when p_scope='MY'

    p_search TEXT DEFAULT NULL,          -- search bar

    p_task_id            BIGINT  DEFAULT NULL,
    p_task_type_id       INTEGER DEFAULT NULL,
    p_date_from          DATE    DEFAULT NULL,
    p_date_to            DATE    DEFAULT NULL,
    p_priority           VARCHAR DEFAULT NULL,
    p_status             VARCHAR DEFAULT NULL,

    p_client_code_prefix  TEXT DEFAULT NULL,
    p_client_name_prefix  TEXT DEFAULT NULL,
    p_client_tim_prefix   TEXT DEFAULT NULL,
    p_client_email_prefix TEXT DEFAULT NULL
)
RETURNS TABLE (
    task_id BIGINT,
    task_type_id INTEGER,
    task_prefix INTEGER,
    chain_id BIGINT,
    transaction_id BIGINT,
    status VARCHAR,
    handled_by_user_id BIGINT,
    assigned_to_user_id BIGINT,
    subject VARCHAR,
    description TEXT,
    priority VARCHAR,
    reminder BOOLEAN,
    call_duration_seconds INTEGER,
    location TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    trader_code VARCHAR,
    trader_name VARCHAR,
    trader_tim  VARCHAR,
    trader_email VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_search TEXT;
    v_search_is_numeric BOOLEAN;
BEGIN
    v_search := NULLIF(trim(p_search), '');
    v_search_is_numeric := (v_search ~ '^[0-9]+$');

    RETURN QUERY
    SELECT
        t.task_id,
        t.task_type_id,
        t.task_prefix,
        t.chain_id,
        t.transaction_id,
        t.status,
        t.handled_by_user_id,
        t.assigned_to_user_id,
        t.subject,
        t.description,
        t.priority,
        t.reminder,
        t.call_duration_seconds,
        t.location,
        t.created_at,
        t.updated_at,

        tr.trader_code,
        tr.company_name,
        tr.tim_number,
        tr.email
    FROM tasks t
    JOIN traders tr
      ON tr.trader_id = t.transaction_id
    WHERE
        -- SCOPE (αυτό κάνει το "μόνο σε εκείνον τον πίνακα")
        (
            p_scope = 'ALL'
            OR (p_scope = 'UNASSIGNED' AND t.assigned_to_user_id IS NULL)
            OR (p_scope = 'MY' AND t.assigned_to_user_id = p_user_id)
        )

        -- FILTERS (φόρμα)
        AND (p_task_id IS NULL OR t.task_id = p_task_id)
        AND (p_task_type_id IS NULL OR t.task_type_id = p_task_type_id)
        AND (p_status IS NULL OR t.status = p_status)
        AND (p_priority IS NULL OR t.priority = p_priority)
        AND (p_date_from IS NULL OR t.created_at::date >= p_date_from)
        AND (p_date_to   IS NULL OR t.created_at::date <= p_date_to)
        AND (p_client_code_prefix  IS NULL OR tr.trader_code ILIKE p_client_code_prefix || '%')
        AND (p_client_name_prefix  IS NULL OR tr.company_name        ILIKE p_client_name_prefix || '%')
        AND (p_client_tim_prefix   IS NULL OR tr.tim_number         ILIKE p_client_tim_prefix || '%')
        AND (p_client_email_prefix IS NULL OR tr.email       ILIKE p_client_email_prefix || '%')

        -- SEARCH BAR (ψάχνει ΜΕΣΑ στο φιλτραρισμένο set)
        AND (
            v_search IS NULL
            OR (v_search_is_numeric AND t.task_id = v_search::bigint)
            OR t.subject ILIKE '%' || v_search || '%'
            OR tr.company_name   ILIKE '%' || v_search || '%'
        )
    ORDER BY t.created_at DESC;
END;
$$;

-- function to search unassigned tasks with search bar
CREATE OR REPLACE FUNCTION search_unassigned_tasks(
    p_search TEXT DEFAULT NULL,

    p_task_id            BIGINT  DEFAULT NULL,
    p_task_type_id       INTEGER DEFAULT NULL,
    p_date_from          DATE    DEFAULT NULL,
    p_date_to            DATE    DEFAULT NULL,
    p_priority           VARCHAR DEFAULT NULL,
    p_status             VARCHAR DEFAULT NULL,

    p_client_code_prefix  TEXT DEFAULT NULL,
    p_client_name_prefix  TEXT DEFAULT NULL,
    p_client_tim_prefix   TEXT DEFAULT NULL,
    p_client_email_prefix TEXT DEFAULT NULL
)
RETURNS SETOF filter_tasks_with_search
LANGUAGE sql
AS $$
    SELECT *
    FROM filter_tasks_with_search(
        p_scope := 'UNASSIGNED',
        p_user_id := NULL,
        p_search := p_search,

        p_task_id := p_task_id,
        p_task_type_id := p_task_type_id,
        p_date_from := p_date_from,
        p_date_to := p_date_to,
        p_priority := p_priority,
        p_status := p_status,

        p_client_code_prefix := p_client_code_prefix,
        p_client_name_prefix := p_client_name_prefix,
        p_client_tim_prefix := p_client_tim_prefix,
        p_client_email_prefix := p_client_email_prefix
    );
$$;

-- function to search my tasks with search bar
CREATE OR REPLACE FUNCTION search_my_tasks(
    p_user_id BIGINT,
    p_search TEXT DEFAULT NULL,

    p_task_id            BIGINT  DEFAULT NULL,
    p_task_type_id       INTEGER DEFAULT NULL,
    p_date_from          DATE    DEFAULT NULL,
    p_date_to            DATE    DEFAULT NULL,
    p_priority           VARCHAR DEFAULT NULL,
    p_status             VARCHAR DEFAULT NULL,

    p_client_code_prefix  TEXT DEFAULT NULL,
    p_client_name_prefix  TEXT DEFAULT NULL,
    p_client_tim_prefix   TEXT DEFAULT NULL,
    p_client_email_prefix TEXT DEFAULT NULL
)
RETURNS SETOF filter_tasks_with_search
LANGUAGE sql
AS $$
    SELECT *
    FROM filter_tasks_with_search(
        p_scope := 'MY',
        p_user_id := p_user_id,
        p_search := p_search,

        p_task_id := p_task_id,
        p_task_type_id := p_task_type_id,
        p_date_from := p_date_from,
        p_date_to := p_date_to,
        p_priority := p_priority,
        p_status := p_status,

        p_client_code_prefix := p_client_code_prefix,
        p_client_name_prefix := p_client_name_prefix,
        p_client_tim_prefix := p_client_tim_prefix,
        p_client_email_prefix := p_client_email_prefix
    );
$$;

-- function to auto-fill client info in task form
-- UI behavior based on the result:
--   • 0 rows   → Show a warning dialog ("No client found").
--   • 1 row    → Auto-fill Client Code, Name and TIM
--                and store trader_id internally for task insertion.
--   • >1 rows  → Open a selection dialog (table/grid) so the user can
--                choose the correct client. After selection, auto-fill
--                all fields and store trader_id.
--
-- The returned trader_id must be used when inserting the task
-- (tasks.transaction_id) to guarantee referential integrity.
CREATE OR REPLACE FUNCTION search_clients_for_task_form(
    p_field TEXT,     -- 'CODE' | 'NAME' | 'TIM'
    p_input TEXT,     -- το value που έγραψε ο χρήστης
    p_only_active BOOLEAN DEFAULT true
)
RETURNS TABLE (
    trader_id BIGINT,
    trader_code VARCHAR,
    company_name VARCHAR,
    tim_number VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_field TEXT;
    v_input TEXT;
BEGIN
    v_field := upper(trim(COALESCE(p_field, '')));
    v_input := NULLIF(trim(p_input), '');

    -- Αν είναι κενό, μην επιστρέψεις τίποτα
    IF v_input IS NULL OR v_field NOT IN ('CODE', 'NAME', 'TIM') THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        t.trader_id,
        t.trader_code,
        t.company_name,
        t.tim_number
    FROM traders t
    WHERE t.type = 'CLIENT'
      AND (NOT p_only_active OR t.status = true)
      AND (
            (v_field = 'CODE' AND t.trader_code ILIKE v_input || '%')
         OR (v_field = 'NAME' AND t.company_name ILIKE v_input || '%')
         OR (v_field = 'TIM'  AND t.tim_number = v_input) -- TIM exact
          )
    ORDER BY
        CASE
            WHEN v_field = 'CODE' THEN t.trader_code
            WHEN v_field = 'NAME' THEN t.company_name
            ELSE t.company_name
        END
    LIMIT 50;
END;
$$;

-- function to get my tasks statistics (UI: my tasks dashboard)
CREATE OR REPLACE FUNCTION get_my_tasks_stats(
    p_user_id BIGINT
)
RETURNS TABLE (
    total_tasks BIGINT,
    assigned_today BIGINT,
    total_urgent BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        -- 1) Total tasks assigned to user (IN_PROGRESS)
        COUNT(*) FILTER (
            WHERE t.status = 'IN_PROGRESS'
        ) AS total_tasks,

        -- 2) Tasks assigned today
        COUNT(*) FILTER (
            WHERE t.status = 'IN_PROGRESS'
              AND t.created_at::date = CURRENT_DATE
        ) AS assigned_today,

        -- 3) Urgent tasks
        COUNT(*) FILTER (
            WHERE t.status = 'IN_PROGRESS'
              AND t.priority = 'HIGH'
        ) AS total_urgent
    FROM tasks t
    WHERE t.assigned_to_user_id = p_user_id;
END;
$$;

-- function to get unassigned tasks statistics (UI: unassigned tasks dashboard)
CREATE OR REPLACE FUNCTION get_unassigned_tasks_stats()
RETURNS TABLE (
    total_tasks INTEGER,
    created_today INTEGER,
    total_urgent INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        -- 1) Total unassigned tasks (IN_PROGRESS)
        COUNT(*) FILTER (
            WHERE t.status = 'IN_PROGRESS'
        ) AS total_tasks,

        -- 2) Unassigned tasks created today
        COUNT(*) FILTER (
            WHERE t.status = 'IN_PROGRESS'
              AND t.created_at::date = CURRENT_DATE
        ) AS created_today,

        -- 3) Urgent unassigned tasks
        COUNT(*) FILTER (
            WHERE t.status = 'IN_PROGRESS'
              AND t.priority = 'HIGH'
        ) AS total_urgent
    FROM tasks t
    WHERE t.assigned_to_user_id IS NULL;
END;
$$;

--------------------------------
#activity history
--------------------------------
-- function to filter activity history (UI: activity history form)
CREATE OR REPLACE FUNCTION filter_activity_history(
    -- Task details
    p_task_type_id INTEGER DEFAULT NULL,  -- dropdown
    p_date_from    DATE    DEFAULT NULL,
    p_date_to      DATE    DEFAULT NULL,

    -- Client details (PREFIX)
    p_client_code_prefix  TEXT DEFAULT NULL, -- C000*
    p_client_name_prefix  TEXT DEFAULT NULL, -- Name*
    p_client_tim_prefix   TEXT DEFAULT NULL, -- TIM*
    p_client_email_prefix TEXT DEFAULT NULL  -- Email*
)
RETURNS TABLE (
    task_id BIGINT,
    task_type_id INTEGER,
    task_prefix INTEGER,
    chain_id BIGINT,
    transaction_id BIGINT,
    status VARCHAR,
    handled_by_user_id BIGINT,
    assigned_to_user_id BIGINT,

    subject VARCHAR,
    description TEXT,
    priority VARCHAR,
    reminder BOOLEAN,
    call_duration_seconds INTEGER,
    location TEXT,

    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    trader_code VARCHAR,
    company_name VARCHAR,
    tim_number VARCHAR,
    email VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.task_id,
        t.task_type_id,
        t.task_prefix,
        t.chain_id,
        t.transaction_id,
        t.status,
        t.handled_by_user_id,
        t.assigned_to_user_id,

        t.subject,
        t.description,
        t.priority,
        t.reminder,
        t.call_duration_seconds,
        t.location,

        t.created_at,
        t.updated_at,

        tr.trader_code,
        tr.company_name,
        tr.tim_number,
        tr.email
    FROM tasks t
    JOIN traders tr
      ON tr.trader_id = t.transaction_id
    WHERE
        -- Task (dropdown)
        (p_task_type_id IS NULL OR t.task_type_id = p_task_type_id)

        -- Date Period
        AND (p_date_from IS NULL OR t.created_at::date >= p_date_from)
        AND (p_date_to   IS NULL OR t.created_at::date <= p_date_to)

        -- Client Details (PREFIX)
        AND (
            p_client_code_prefix IS NULL OR trim(p_client_code_prefix) = ''
            OR tr.trader_code ILIKE trim(p_client_code_prefix) || '%'
        )
        AND (
            p_client_name_prefix IS NULL OR trim(p_client_name_prefix) = ''
            OR tr.company_name ILIKE trim(p_client_name_prefix) || '%'
        )
        AND (
            p_client_tim_prefix IS NULL OR trim(p_client_tim_prefix) = ''
            OR tr.tim_number ILIKE trim(p_client_tim_prefix) || '%'
        )
        AND (
            p_client_email_prefix IS NULL OR trim(p_client_email_prefix) = ''
            OR tr.email ILIKE trim(p_client_email_prefix) || '%'
        )

    ORDER BY t.created_at DESC;
END;
$$;
--------------------------------
# events
--------------------------------
CREATE TABLE events (
    event_id BIGSERIAL PRIMARY KEY,

    -- Αυτόματο event code: E + event_id (π.χ. E1, E25, E103)
    event_code VARCHAR(20)
        GENERATED ALWAYS AS ('E' || event_id::text) STORED
        UNIQUE,

    title       VARCHAR(200) NOT NULL,
    event_date  DATE NOT NULL,
    event_time  TIME NOT NULL,

    description TEXT,

    -- contact info
    contact_email VARCHAR(254),
    contact_phone VARCHAR(50),

    -- location info
    street_address VARCHAR(255),
    city           VARCHAR(120),
    state          VARCHAR(120),
    zip_code       VARCHAR(20),

    created_by_user_id BIGINT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_events_created_by
        FOREIGN KEY (created_by_user_id)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- table to store event participants (many-to-many relationship between events and users)
CREATE TABLE event_participants (
    event_id BIGINT NOT NULL,
    user_id  BIGINT NOT NULL,

    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (event_id, user_id),

    CONSTRAINT fk_event_participants_event
        FOREIGN KEY (event_id)
        REFERENCES events(event_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_event_participants_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- function to sync event participants
CREATE OR REPLACE FUNCTION sync_event_participants(
    p_event_id BIGINT,
    p_selected_user_ids BIGINT[]
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    -- Αν ο χρήστης δεν έχει επιλέξει κανέναν -> καθάρισε όλους
    IF p_selected_user_ids IS NULL OR array_length(p_selected_user_ids, 1) IS NULL THEN
        DELETE FROM event_participants
        WHERE event_id = p_event_id;
        RETURN;
    END IF;

    -- 1) Διέγραψε όσους ΔΕΝ είναι πλέον επιλεγμένοι
    DELETE FROM event_participants ep
    WHERE ep.event_id = p_event_id
      AND ep.user_id NOT IN (
          SELECT DISTINCT unnest(p_selected_user_ids)
      );

    -- 2) Πρόσθεσε όσους είναι επιλεγμένοι και λείπουν
    INSERT INTO event_participants (event_id, user_id)
    SELECT p_event_id, x.user_id
    FROM (
        SELECT DISTINCT unnest(p_selected_user_ids) AS user_id
    ) x
    WHERE x.user_id IS NOT NULL
    ON CONFLICT (event_id, user_id) DO NOTHING;
END;
$$;

-- function to insert a new event
CREATE OR REPLACE FUNCTION insert_event(
    p_title      VARCHAR,
    p_event_date DATE,
    p_event_time TIME,
    p_description TEXT DEFAULT NULL,

    p_contact_email VARCHAR DEFAULT NULL,
    p_contact_phone VARCHAR DEFAULT NULL,

    p_street_address VARCHAR DEFAULT NULL,
    p_city           VARCHAR DEFAULT NULL,
    p_state          VARCHAR DEFAULT NULL,
    p_zip_code       VARCHAR DEFAULT NULL,

    p_created_by_user_id BIGINT DEFAULT NULL,
    p_selected_user_ids BIGINT[] DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_event_id BIGINT;
BEGIN
    INSERT INTO events (
        title, event_date, event_time, description,
        contact_email, contact_phone,
        street_address, city, state, zip_code,
        created_by_user_id
    )
    VALUES (
        p_title, p_event_date, p_event_time, p_description,
        p_contact_email, p_contact_phone,
        p_street_address, p_city, p_state, p_zip_code,
        p_created_by_user_id
    )
    RETURNING event_id INTO v_event_id;

    PERFORM sync_event_participants(v_event_id, p_selected_user_ids);

    RETURN v_event_id;
END;
$$;

-- function to update an existing event
CREATE OR REPLACE FUNCTION update_event(
    p_event_id   BIGINT,
    p_title      VARCHAR,
    p_event_date DATE,
    p_event_time TIME,
    p_description TEXT DEFAULT NULL,

    p_contact_email VARCHAR DEFAULT NULL,
    p_contact_phone VARCHAR DEFAULT NULL,

    p_street_address VARCHAR DEFAULT NULL,
    p_city           VARCHAR DEFAULT NULL,
    p_state          VARCHAR DEFAULT NULL,
    p_zip_code       VARCHAR DEFAULT NULL,

    p_selected_user_ids BIGINT[] DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE events
    SET
        title = p_title,
        event_date = p_event_date,
        event_time = p_event_time,
        description = p_description,
        contact_email = p_contact_email,
        contact_phone = p_contact_phone,
        street_address = p_street_address,
        city = p_city,
        state = p_state,
        zip_code = p_zip_code,
        updated_at = now()
    WHERE event_id = p_event_id;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    PERFORM sync_event_participants(p_event_id, p_selected_user_ids);
    RETURN TRUE;
END;
$$;

-- function to delete an event
CREATE OR REPLACE FUNCTION delete_event(
    p_event_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM events
    WHERE event_id = p_event_id;
    RETURN FOUND;
END;
$$;

-- indexes
CREATE INDEX IF NOT EXISTS ix_events_event_date
    ON events(event_date);

CREATE INDEX IF NOT EXISTS ix_event_participants_user_id
    ON event_participants(user_id);

-- function to get upcoming events for the current user (UI: reminders list)
CREATE OR REPLACE FUNCTION get_upcoming_events_for_user(
    p_user_id BIGINT
)
RETURNS TABLE (
    event_id BIGINT,
    event_code VARCHAR,
    title VARCHAR,
    event_date DATE,
    event_time TIME,
    description TEXT,

    contact_email VARCHAR,
    contact_phone VARCHAR,

    street_address VARCHAR,
    city VARCHAR,
    state VARCHAR,
    zip_code VARCHAR,

    created_by_user_id BIGINT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.event_id,
        e.event_code,
        e.title,
        e.event_date,
        e.event_time,
        e.description,

        e.contact_email,
        e.contact_phone,

        e.street_address,
        e.city,
        e.state,
        e.zip_code,

        e.created_by_user_id,
        e.created_at,
        e.updated_at
    FROM events e
    INNER JOIN event_participants ep
        ON ep.event_id = e.event_id
       AND ep.user_id = p_user_id
    WHERE e.event_date >= CURRENT_DATE
    ORDER BY e.event_date, e.event_time;
END;
$$;

-- function to get calendar month with events (UI: calendar view)
CREATE OR REPLACE FUNCTION get_calendar_month_for_user(
    p_year    INT,
    p_month   INT,
    p_user_id BIGINT
)
RETURNS TABLE (
    day_date DATE,
    events   JSONB
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_start DATE;
    v_end   DATE;
BEGIN
    v_start := make_date(p_year, p_month, 1);
    v_end   := (v_start + INTERVAL '1 month - 1 day')::date;

    RETURN QUERY
    SELECT
        d.day_date,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'event_id',   e.event_id,
                    'event_code', e.event_code,
                    'title',      e.title,
                    'time',       to_char(e.event_time, 'HH24:MI')
                )
                ORDER BY e.event_time, e.title
            ) FILTER (WHERE e.event_id IS NOT NULL),
            '[]'::jsonb
        ) AS events
    FROM (
        SELECT generate_series(v_start, v_end, INTERVAL '1 day')::date AS day_date
    ) d
    LEFT JOIN (
        SELECT e.*
        FROM events e
        INNER JOIN event_participants ep
            ON ep.event_id = e.event_id
           AND ep.user_id = p_user_id
    ) e
        ON e.event_date = d.day_date
    GROUP BY d.day_date
    ORDER BY d.day_date;
END;
$$;

-- function to filter events for a specific user (UI: reminders filter)
CREATE OR REPLACE FUNCTION filter_events_for_user(
    p_user_id   BIGINT,
    p_event_ref TEXT DEFAULT NULL,  -- μπορεί να είναι "25" ή "E25"
    p_date_from DATE DEFAULT NULL,
    p_date_to   DATE DEFAULT NULL
)
RETURNS TABLE (
    event_id BIGINT,
    event_code VARCHAR,
    title VARCHAR,
    event_date DATE,
    event_time TIME,
    description TEXT,

    contact_email VARCHAR,
    contact_phone VARCHAR,

    street_address VARCHAR,
    city VARCHAR,
    state VARCHAR,
    zip_code VARCHAR,

    created_by_user_id BIGINT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.event_id,
        e.event_code,
        e.title,
        e.event_date,
        e.event_time,
        e.description,

        e.contact_email,
        e.contact_phone,

        e.street_address,
        e.city,
        e.state,
        e.zip_code,

        e.created_by_user_id,
        e.created_at,
        e.updated_at
    FROM events e
    INNER JOIN event_participants ep
        ON ep.event_id = e.event_id
       AND ep.user_id = p_user_id
    WHERE
        -- Event Id φίλτρο (δέχεται "25" ή "E25")
        (
            p_event_ref IS NULL OR trim(p_event_ref) = ''
            OR e.event_id = NULLIF(regexp_replace(trim(p_event_ref), '[^0-9]', '', 'g'), '')::BIGINT
            OR e.event_code = upper(trim(p_event_ref))
        )

        -- Αν ΔΕΝ έχουν δοθεί ημερομηνίες -> φέρ’ τα ΟΛΑ (χωρίς CURRENT_DATE φίλτρο)
        AND (
            (p_date_from IS NULL AND p_date_to IS NULL)
            OR
            (
                (p_date_from IS NULL OR e.event_date >= p_date_from)
                AND
                (p_date_to   IS NULL OR e.event_date <= p_date_to)
            )
        )
    ORDER BY e.event_date, e.event_time;
END;
$$;

-- function to filter events for a specific user with search bar (UI: reminders search bar)
CREATE OR REPLACE FUNCTION filter_events_for_user_with_search(
    p_user_id   BIGINT,

    p_search    TEXT DEFAULT NULL,   -- search bar (title prefix)

    p_event_ref TEXT DEFAULT NULL,   -- "25" ή "E25"
    p_date_from DATE DEFAULT NULL,
    p_date_to   DATE DEFAULT NULL
)
RETURNS TABLE (
    event_id BIGINT,
    event_code VARCHAR,
    title VARCHAR,
    event_date DATE,
    event_time TIME,
    description TEXT,

    contact_email VARCHAR,
    contact_phone VARCHAR,

    street_address VARCHAR,
    city VARCHAR,
    state VARCHAR,
    zip_code VARCHAR,

    created_by_user_id BIGINT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_search TEXT;
BEGIN
    -- Καθαρίζουμε το search bar
    v_search := NULLIF(trim(p_search), '');

    RETURN QUERY
    SELECT
        e.event_id,
        e.event_code,
        e.title,
        e.event_date,
        e.event_time,
        e.description,

        e.contact_email,
        e.contact_phone,

        e.street_address,
        e.city,
        e.state,
        e.zip_code,

        e.created_by_user_id,
        e.created_at,
        e.updated_at
    FROM events e
    INNER JOIN event_participants ep
        ON ep.event_id = e.event_id
       AND ep.user_id = p_user_id
    WHERE
        -- Event Id φίλτρο (δέχεται "25" ή "E25")
        (
            p_event_ref IS NULL OR trim(p_event_ref) = ''
            OR e.event_id = NULLIF(
                    regexp_replace(trim(p_event_ref), '[^0-9]', '', 'g'),
                    ''
                )::BIGINT
            OR e.event_code = upper(trim(p_event_ref))
        )

        -- Date range φίλτρο
        AND (
            (p_date_from IS NULL AND p_date_to IS NULL)
            OR
            (
                (p_date_from IS NULL OR e.event_date >= p_date_from)
                AND
                (p_date_to   IS NULL OR e.event_date <= p_date_to)
            )
        )

        -- SEARCH BAR (PREFIX στον τίτλο, ΠΑΝΩ στο φιλτραρισμένο αποτέλεσμα)
        AND (
            v_search IS NULL
            OR e.title ILIKE v_search || '%'
        )

    ORDER BY e.event_date, e.event_time;
END;
$$;
--------------------------------
# chat messages
--------------------------------
-- table to store chat conversations between users
CREATE TABLE IF NOT EXISTS chat_conversations (
    conversation_id BIGSERIAL PRIMARY KEY,

    user_a_id BIGINT NOT NULL REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    user_b_id BIGINT NOT NULL REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- δεν επιτρέπουμε "chat με τον εαυτό μου"
    CONSTRAINT chk_chat_users_distinct CHECK (user_a_id <> user_b_id),

    -- μοναδική συνομιλία για το ίδιο ζευγάρι
    CONSTRAINT uq_chat_user_pair UNIQUE (user_a_id, user_b_id)
);

CREATE INDEX IF NOT EXISTS ix_chat_conversations_updated_at
    ON chat_conversations(updated_at DESC);

-- table to store chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
    message_id BIGSERIAL PRIMARY KEY,

    conversation_id BIGINT NOT NULL REFERENCES chat_conversations(conversation_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    sender_user_id BIGINT NOT NULL REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    body TEXT NOT NULL,

    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    edited_at TIMESTAMPTZ NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- indexes
CREATE INDEX IF NOT EXISTS ix_chat_messages_conversation_created
    ON chat_messages(conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_chat_messages_sender
    ON chat_messages(sender_user_id);

-- table to store read state of chat messages per user
CREATE TABLE IF NOT EXISTS chat_read_state (
    conversation_id BIGINT NOT NULL REFERENCES chat_conversations(conversation_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    user_id BIGINT NOT NULL REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    last_read_message_id BIGINT NULL REFERENCES chat_messages(message_id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (conversation_id, user_id)
);

-- indexes
CREATE INDEX IF NOT EXISTS ix_chat_read_state_user
    ON chat_read_state(user_id);

-- function to create or get a direct conversation between two users
CREATE OR REPLACE FUNCTION create_or_get_direct_conversation(
    p_user_1 BIGINT,
    p_user_2 BIGINT
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_a BIGINT;
    v_b BIGINT;
    v_conversation_id BIGINT;
BEGIN
    IF p_user_1 = p_user_2 THEN
        RAISE EXCEPTION 'Cannot create direct conversation with same user_id (%)', p_user_1;
    END IF;

    v_a := LEAST(p_user_1, p_user_2);
    v_b := GREATEST(p_user_1, p_user_2);

    INSERT INTO chat_conversations (user_a_id, user_b_id)
    VALUES (v_a, v_b)
    ON CONFLICT (user_a_id, user_b_id) DO NOTHING;

    SELECT conversation_id
    INTO v_conversation_id
    FROM chat_conversations
    WHERE user_a_id = v_a AND user_b_id = v_b;

    -- init read_state rows (αν δεν υπάρχουν)
    INSERT INTO chat_read_state (conversation_id, user_id)
    VALUES (v_conversation_id, v_a)
    ON CONFLICT (conversation_id, user_id) DO NOTHING;

    INSERT INTO chat_read_state (conversation_id, user_id)
    VALUES (v_conversation_id, v_b)
    ON CONFLICT (conversation_id, user_id) DO NOTHING;

    RETURN v_conversation_id;
END;
$$;

-- function to insert a new chat message
CREATE OR REPLACE FUNCTION insert_chat_message(
    p_conversation_id BIGINT,
    p_sender_user_id  BIGINT,
    p_body            TEXT
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_message_id BIGINT;
BEGIN
    -- (προαιρετικό) έλεγχος ότι ο sender ανήκει στη συνομιλία
    IF NOT EXISTS (
        SELECT 1
        FROM chat_conversations c
        WHERE c.conversation_id = p_conversation_id
          AND (c.user_a_id = p_sender_user_id OR c.user_b_id = p_sender_user_id)
    ) THEN
        RAISE EXCEPTION 'Sender user_id % is not a participant of conversation %',
            p_sender_user_id, p_conversation_id;
    END IF;

    INSERT INTO chat_messages (conversation_id, sender_user_id, body)
    VALUES (p_conversation_id, p_sender_user_id, p_body)
    RETURNING message_id INTO v_message_id;

    UPDATE chat_conversations
    SET updated_at = now()
    WHERE conversation_id = p_conversation_id;

    RETURN v_message_id;
END;
$$;

-- function to mark messages as read in a conversation for a user
CREATE OR REPLACE FUNCTION mark_conversation_read(
    p_conversation_id BIGINT,
    p_user_id BIGINT,
    p_last_read_message_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE chat_read_state
    SET last_read_message_id = p_last_read_message_id,
        updated_at = now()
    WHERE conversation_id = p_conversation_id
      AND user_id = p_user_id;

    RETURN FOUND;
END;
$$;

-- function to get messages for a conversation
CREATE OR REPLACE FUNCTION get_conversation_messages(
    p_conversation_id BIGINT,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    message_id BIGINT,
    sender_user_id BIGINT,
    body TEXT,
    is_deleted BOOLEAN,
    edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ
)
LANGUAGE sql
AS $$
    SELECT
        m.message_id,
        m.sender_user_id,
        m.body,
        m.is_deleted,
        m.edited_at,
        m.created_at
    FROM chat_messages m
    WHERE m.conversation_id = p_conversation_id
    ORDER BY m.created_at DESC
    LIMIT p_limit;
$$;

-- function to get conversations for a user with last message and unread count (we will need it for the chat sidebar)
CREATE OR REPLACE FUNCTION get_my_conversations(
    p_user_id BIGINT,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    conversation_id BIGINT,
    other_user_id BIGINT,
    updated_at TIMESTAMPTZ,

    last_message_id BIGINT,
    last_message_sender_user_id BIGINT,
    last_message_body TEXT,
    last_message_created_at TIMESTAMPTZ,

    unread_count BIGINT
)
LANGUAGE sql
AS $$
    SELECT
        c.conversation_id,
        CASE
            WHEN c.user_a_id = p_user_id THEN c.user_b_id
            ELSE c.user_a_id
        END AS other_user_id,
        c.updated_at,

        lm.message_id AS last_message_id,
        lm.sender_user_id AS last_message_sender_user_id,
        lm.body AS last_message_body,
        lm.created_at AS last_message_created_at,

        COALESCE((
            SELECT COUNT(*)
            FROM chat_messages m
            LEFT JOIN chat_read_state rs
              ON rs.conversation_id = c.conversation_id
             AND rs.user_id = p_user_id
            WHERE m.conversation_id = c.conversation_id
              -- unread μόνο από τον άλλον
              AND m.sender_user_id <> p_user_id
              -- αν δεν υπάρχει last_read_message_id -> όλα unread
              AND (
                    rs.last_read_message_id IS NULL
                    OR m.message_id > rs.last_read_message_id
                  )
        ), 0) AS unread_count

    FROM chat_conversations c

    -- last message (LATERAL: 1 row ανά conversation)
    LEFT JOIN LATERAL (
        SELECT m1.message_id, m1.sender_user_id, m1.body, m1.created_at
        FROM chat_messages m1
        WHERE m1.conversation_id = c.conversation_id
        ORDER BY m1.created_at DESC
        LIMIT 1
    ) lm ON TRUE

    WHERE c.user_a_id = p_user_id OR c.user_b_id = p_user_id
    ORDER BY c.updated_at DESC
    LIMIT p_limit;
$$;

--------------------------------
# settings
--------------------------------
-- table to store user addition requests
CREATE TABLE user_add_requests (
    request_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    -- ΣΤΟΙΧΕΙΑ ΝΕΟΥ ΧΡΗΣΤΗ (REQUESTED)
    role_id    BIGINT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name  VARCHAR(100) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    phone      VARCHAR(30),

    -- ΠΟΙΟΣ ΚΑΝΕΙ ΤΟ ΑΙΤΗΜΑ
    requested_by_user_id BIGINT NOT NULL,

    -- ΧΡΟΝΟΣ ΑΙΤΗΜΑΤΟΣ
    requested_at TIMESTAMP NOT NULL DEFAULT now(),

    -- ΚΑΤΑΣΤΑΣΗ ΑΙΤΗΜΑΤΟΣ
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),

    -- FOREIGN KEYS
    CONSTRAINT fk_user_add_requests_role
        FOREIGN KEY (role_id) REFERENCES roles(role_id),

    CONSTRAINT fk_user_add_requests_requested_by
        FOREIGN KEY (requested_by_user_id) REFERENCES users(user_id),

    CONSTRAINT fk_user_add_requests_processed_by
        FOREIGN KEY (processed_by_user_id) REFERENCES users(user_id)
);

-- trigger to allow only Admins to create user add requests
CREATE OR REPLACE FUNCTION trg_only_admin_can_request_add_user()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_role_id BIGINT;
BEGIN
    SELECT role_id
    INTO v_role_id
    FROM users
    WHERE user_id = NEW.requested_by_user_id;

    IF v_role_id IS NULL THEN
        RAISE EXCEPTION 'User % does not exist', NEW.requested_by_user_id;
    END IF;

    IF v_role_id <> 1 THEN
        RAISE EXCEPTION 'Only Admin can create task type requests';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER t_only_admin_can_request_add_user
BEFORE INSERT ON user_add_requests
FOR EACH ROW
EXECUTE FUNCTION trg_only_admin_can_request_add_user();

-- table to store user delete requests
CREATE TABLE user_delete_requests (
    request_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    -- ΠΟΙΟΣ ΧΡΗΣΤΗΣ ΖΗΤΕΙΤΑΙ ΝΑ ΔΙΑΓΡΑΦΕΙ
    target_user_id BIGINT NOT NULL,

    -- ΠΟΙΟΣ ΚΑΝΕΙ ΤΟ ΑΙΤΗΜΑ
    requested_by_user_id BIGINT NOT NULL,

    -- ΧΡΟΝΟΣ ΑΙΤΗΜΑΤΟΣ
    requested_at TIMESTAMP NOT NULL DEFAULT now(),

    -- ΚΑΤΑΣΤΑΣΗ ΑΙΤΗΜΑΤΟΣ
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),

    -- FOREIGN KEYS
    CONSTRAINT fk_udr_target_user
        FOREIGN KEY (target_user_id) REFERENCES users(user_id),

    CONSTRAINT fk_udr_requested_by
        FOREIGN KEY (requested_by_user_id) REFERENCES users(user_id),

    CONSTRAINT fk_udr_processed_by
        FOREIGN KEY (processed_by_user_id) REFERENCES users(user_id),

    --Δεν επιτρέπεται να ζητήσεις διαγραφή του ίδιου σου του user
    CONSTRAINT chk_not_self_delete
        CHECK (target_user_id <> requested_by_user_id)
);

-- trigger to allow only Admins to create user delete requests
CREATE OR REPLACE FUNCTION trg_only_admin_can_request_delete_user()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_role_id BIGINT;
BEGIN
    SELECT role_id
    INTO v_role_id
    FROM users
    WHERE user_id = NEW.requested_by_user_id;

    IF v_role_id IS NULL THEN
        RAISE EXCEPTION 'User % does not exist', NEW.requested_by_user_id;
    END IF;

    IF v_role_id <> 1 THEN
        RAISE EXCEPTION 'Only Admin can create user delete requests';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER t_only_admin_can_request_delete_user
BEFORE INSERT ON user_delete_requests
FOR EACH ROW
EXECUTE FUNCTION trg_only_admin_can_request_delete_user();

-- index to prevent multiple PENDING delete requests for the same user
CREATE UNIQUE INDEX ux_user_delete_requests_pending
ON user_delete_requests (target_user_id)
WHERE status = 'PENDING';

-- table to store task type addition requests
CREATE TABLE task_type_requests (
    request_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    -- ΣΤΟΙΧΕΙΑ TASK TYPE ΠΟΥ ΖΗΤΕΙΤΑΙ
    task_type_name VARCHAR(100) NOT NULL,
    task_type_code VARCHAR(5) NOT NULL,

    -- ΠΟΙΟΣ ΚΑΝΕΙ ΤΟ ΑΙΤΗΜΑ
    requested_by_user_id BIGINT NOT NULL,

    -- ΧΡΟΝΟΣ ΑΙΤΗΜΑΤΟΣ
    requested_at TIMESTAMP NOT NULL DEFAULT now(),

    -- ΚΑΤΑΣΤΑΣΗ ΑΙΤΗΜΑΤΟΣ
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),

    -- FOREIGN KEYS
    CONSTRAINT fk_ttr_requested_by
        FOREIGN KEY (requested_by_user_id) REFERENCES users(user_id),

    CONSTRAINT fk_ttr_processed_by
        FOREIGN KEY (processed_by_user_id) REFERENCES users(user_id)
);

-- trigger to allow only Admins to create task type requests
CREATE OR REPLACE FUNCTION trg_only_admin_can_request_task_type()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_role_id BIGINT;
BEGIN
    SELECT role_id
    INTO v_role_id
    FROM users
    WHERE user_id = NEW.requested_by_user_id;

    IF v_role_id IS NULL THEN
        RAISE EXCEPTION 'User % does not exist', NEW.requested_by_user_id;
    END IF;

    IF v_role_id <> 1 THEN
        RAISE EXCEPTION 'Only Admin can create task type requests';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER t_only_admin_can_request_task_type
BEFORE INSERT ON task_type_requests
FOR EACH ROW
EXECUTE FUNCTION trg_only_admin_can_request_task_type();