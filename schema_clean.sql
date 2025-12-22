
> CREATE TABLE public.admin (
      id integer NOT NULL,
      username character varying(100) NOT NULL,
      email character varying(255) NOT NULL,
      password character varying(255) NOT NULL,
      created_at timestamp without time zone DEFAULT 
CURRENT_TIMESTAMP
> CREATE TABLE public.admin_activity_log (
      id integer NOT NULL,
      admin_id integer,
      action character varying(255) NOT NULL,
      target_type character varying(50),
      target_id integer,
> CREATE SEQUENCE public.admin_activity_log_id_seq
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
> ALTER SEQUENCE public.admin_activity_log_id_seq OWNER TO postgres;
  
  --
  -- Name: admin_activity_log_id_seq; Type: SEQUENCE OWNED BY; 
Schema: public; Owner: postgres
  --
  
> ALTER SEQUENCE public.admin_activity_log_id_seq OWNED BY 
public.admin_activity_log.id;
  
  
  --
  -- Name: admin_id_seq; Type: SEQUENCE; Schema: public; Owner: 
postgres
  --
> CREATE SEQUENCE public.admin_id_seq
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
> ALTER SEQUENCE public.admin_id_seq OWNER TO postgres;
  
  --
  -- Name: admin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; 
Owner: postgres
  --
  
> ALTER SEQUENCE public.admin_id_seq OWNED BY public.admin.id;
  
  
  --
  -- Name: badges; Type: TABLE; Schema: public; Owner: postgres
  --
> CREATE TABLE public.badges (
      id integer NOT NULL,
      user_id integer NOT NULL,
      badge_name character varying(100) NOT NULL,
      earned_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
  );
> CREATE SEQUENCE public.badges_id_seq
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
> ALTER SEQUENCE public.badges_id_seq OWNER TO postgres;
  
  --
  -- Name: badges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; 
Owner: postgres
  --
  
> ALTER SEQUENCE public.badges_id_seq OWNED BY public.badges.id;
  
  
  --
  -- Name: challenge_logs; Type: TABLE; Schema: public; Owner: 
postgres
  --
> CREATE TABLE public.challenge_logs (
      id integer NOT NULL,
      user_challenge_id integer NOT NULL,
      date date NOT NULL,
      status character varying(20) NOT NULL
  );
> CREATE SEQUENCE public.challenge_logs_id_seq
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
> ALTER SEQUENCE public.challenge_logs_id_seq OWNER TO postgres;
  
  --
  -- Name: challenge_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: 
public; Owner: postgres
  --
  
> ALTER SEQUENCE public.challenge_logs_id_seq OWNED BY 
public.challenge_logs.id;
  
  
  --
  -- Name: challenges; Type: TABLE; Schema: public; Owner: postgres
  --
> CREATE TABLE public.challenges (
      id integer NOT NULL,
      title character varying(255) NOT NULL,
      description text,
      duration_days integer NOT NULL,
      xp_reward integer DEFAULT 100,
> CREATE SEQUENCE public.challenges_id_seq
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
> ALTER SEQUENCE public.challenges_id_seq OWNER TO postgres;
  
  --
  -- Name: challenges_id_seq; Type: SEQUENCE OWNED BY; Schema: 
public; Owner: postgres
  --
  
> ALTER SEQUENCE public.challenges_id_seq OWNED BY 
public.challenges.id;
  
  
  --
  -- Name: habit_logs; Type: TABLE; Schema: public; Owner: postgres
  --
> CREATE TABLE public.habit_logs (
      id integer NOT NULL,
      habit_id integer NOT NULL,
      date date NOT NULL,
      status character varying(20) NOT NULL
  );
> CREATE SEQUENCE public.habit_logs_id_seq
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
> ALTER SEQUENCE public.habit_logs_id_seq OWNER TO postgres;
  
  --
  -- Name: habit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: 
public; Owner: postgres
  --
  
> ALTER SEQUENCE public.habit_logs_id_seq OWNED BY 
public.habit_logs.id;
  
  
  --
  -- Name: habits; Type: TABLE; Schema: public; Owner: postgres
  --
> CREATE TABLE public.habits (
      id integer NOT NULL,
      user_id integer NOT NULL,
      name character varying(255) NOT NULL,
      category character varying(50),
      frequency character varying(50) DEFAULT 'Daily'::character 
varying,
> CREATE SEQUENCE public.habits_id_seq
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
> ALTER SEQUENCE public.habits_id_seq OWNER TO postgres;
  
  --
  -- Name: habits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; 
Owner: postgres
  --
  
> ALTER SEQUENCE public.habits_id_seq OWNED BY public.habits.id;
  
  
  --
  -- Name: user_challenges; Type: TABLE; Schema: public; Owner: 
postgres
  --
> CREATE TABLE public.user_challenges (
      id integer NOT NULL,
      user_id integer NOT NULL,
      challenge_id integer NOT NULL,
      start_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
      status character varying(50) DEFAULT 'in_progress'::character 
varying,
> CREATE SEQUENCE public.user_challenges_id_seq
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
> ALTER SEQUENCE public.user_challenges_id_seq OWNER TO postgres;
  
  --
  -- Name: user_challenges_id_seq; Type: SEQUENCE OWNED BY; Schema: 
public; Owner: postgres
  --
  
> ALTER SEQUENCE public.user_challenges_id_seq OWNED BY 
public.user_challenges.id;
  
  
  --
  -- Name: users; Type: TABLE; Schema: public; Owner: postgres
  --
> CREATE TABLE public.users (
      id integer NOT NULL,
      username character varying(50) NOT NULL,
      email character varying(255) NOT NULL,
      password character varying(255) NOT NULL,
      xp integer DEFAULT 0,
> CREATE SEQUENCE public.users_id_seq
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
> ALTER SEQUENCE public.users_id_seq OWNER TO postgres;
  
  --
  -- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; 
Owner: postgres
  --
  
> ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
  
  
  --
  -- Name: admin id; Type: DEFAULT; Schema: public; Owner: postgres
  --


