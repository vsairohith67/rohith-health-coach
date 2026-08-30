# RC6 public-signup negative-test report

Verified: 2026-08-30

## Mandatory precondition

Hosted readback is `disable_signup=false`; public email signup is still enabled. The six-case hosted gate is defined to run only after signup is disabled. Direct signup tests A and D were deliberately not sent because their current documented behavior could create an unauthorized user.

## Results

| Case                                           | Result                                                           |
| ---------------------------------------------- | ---------------------------------------------------------------- |
| A. Direct public email signup                  | NOT RUN — hard precondition failed                               |
| B. Unknown email with `shouldCreateUser=false` | PASS — application request used false; no user created           |
| C. Application UI unknown email                | PASS — generic response; no user created                         |
| D. Direct Auth API signup                      | NOT RUN — hard precondition failed                               |
| E. Anonymous signup                            | NOT RUN — hard precondition failed; setting readback is disabled |
| F. Phone signup                                | NOT RUN — hard precondition failed; setting readback is disabled |

Exact result: **2/6 passed; 4/6 not run; 0 unsafe users created**.

Post-test exact SQL readback:

- `auth.users=0`
- `auth.sessions=0`
- `auth.refresh_tokens=0`

## Verdict

Hard gate: **FAIL / INCOMPLETE**. Do not deploy the private Production target or begin real-data work.
