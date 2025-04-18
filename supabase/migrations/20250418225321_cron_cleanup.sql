create extension pg_cron with schema pg_catalog;

grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

select cron.schedule (
  'everyday_cleaup', -- name of the cron job
  '30 5 * * *', -- Everyday at 5:30AM (GMT)
  $$ delete from rooms where updated_at < now() - interval '1 day' $$
);
