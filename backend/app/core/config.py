from pydantic import BaseSettings, Field
from typing import List


class Settings(BaseSettings):
    app_name: str = "darkweb-guard"
    environment: str = "development"
    secret_key: str = Field("CHANGE_ME", env="SECRET_KEY")
    access_token_expire_minutes: int = 60
    postgres_dsn: str = Field("postgresql+psycopg2://darkweb:darkweb@localhost:5432/darkweb_guard", env="DATABASE_URL")
    redis_url: str = Field("redis://localhost:6379/0", env="REDIS_URL")
    master_key: str = Field("CHANGE_ME", env="MASTER_KEY")
    smtp_host: str | None = Field(default=None, env="SMTP_HOST")
    smtp_port: int = Field(default=587, env="SMTP_PORT")
    smtp_user: str | None = Field(default=None, env="SMTP_USER")
    smtp_password: str | None = Field(default=None, env="SMTP_PASSWORD")
    smtp_from: str = Field(default="alerts@darkweb-guard.local", env="SMTP_FROM")
    twilio_account_sid: str | None = Field(default=None, env="TWILIO_ACCOUNT_SID")
    twilio_auth_token: str | None = Field(default=None, env="TWILIO_AUTH_TOKEN")
    twilio_from_number: str | None = Field(default=None, env="TWILIO_FROM_NUMBER")
    allowed_origins: List[str] = Field(default=["http://localhost:5173"], env="ALLOWED_ORIGINS")
    rate_limit_per_minute: int = 120

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
