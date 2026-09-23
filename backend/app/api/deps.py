"""GitHub logins: validated before they reach a GitHub URL."""

from typing import Annotated

from fastapi import Path

# GitHub's rule: 1-39 letters, digits and hyphens, not starting or ending with a hyphen.
GITHUB_LOGIN = r"^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$"

Username = Annotated[str, Path(pattern=GITHUB_LOGIN, description="A GitHub username")]
