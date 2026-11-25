import { CredentialsSignin } from "next-auth";

export class InvalidCredentials extends CredentialsSignin {
  code = "INVALID_CREDENTIALS";
}

export class EmailNotVerified extends CredentialsSignin {
  code = "EMAIL_NOT_VERIFIED";
}

export class AccountDisabled extends CredentialsSignin {
  code = "ACCOUNT_DISABLED";
}

export class AuthRateLimited extends CredentialsSignin {
  code = "RATE_LIMITED";
}
