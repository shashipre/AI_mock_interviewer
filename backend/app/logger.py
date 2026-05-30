import logging
import sys
from app.config import settings 


def setup_logger(name: str) -> logging.Logger:

    logger = logging.getLogger(name)

    if logger.handlers:
        return logger
    level = logging.DEBUG if settings.debug else logging.INFO
    logger.setLevel(level)

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_handler.setFormatter(logging.Formatter(
        fmt = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt = "%Y-%m-%d %H:%M:%S"
        ))
    logger.addHandler(console_handler)

    return logger

logger = setup_logger("app")

    