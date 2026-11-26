# Phase 10 QA

**Date:** 2026-11-26
**Site:** https://bumayed.vercel.app
**Accounts:** seller, dealer, moderator, and super-admin dev accounts

Test listings and the dealer package used for this pass were removed or refunded afterward. The QA report was dismissed.

## Sandbox payment

| Check | Result |
|---|---|
| Promotion checkout does not grant until the signed webhook | Pass |
| Success, repeat success, refund | `grant`, then `ignore`, then `revoke` |
| Failed payment and duplicate event id | `mark_failed`, then `duplicate` |
| Dealer Basic package | `grant` made the subscription ACTIVE, refund set it back to none |
| Forged signature, wrong provider, anonymous simulate | 401, 403, 401 |

## Search and listings

| Check | Result |
|---|---|
| Keyword, price, year, emirate, mileage, fuel, transmission, condition, regional spec | Pass on the live catalog |
| Seller type | Dealer returns the three dealer cars. Individual returns none in cars and the Harley in motorcycles |
| Boat type and motorcycle type | Pass |
| Sort price ascending | Land Cruiser, Patrol, G 63 |
| Invalid category | 400 |
| Invalid sort | Dropped; results stay on newest |
| Pagination | Only one page of data exists (page size 9). Asking for page 2 clamps back to page 1 |
| Listing detail | Call and WhatsApp links, Share, Report, and Add to favorites are on the page |
| Favorites | Add and remove returned 200 and the list updated |
| Report | Created, visible to admin, then dismissed. Seller inbox received `REPORT_RESOLVED` |
| Create, submit, approve, remove | A temporary Camry was created, submitted, approved, and removed. It is no longer in public search |
| Pause while pending | Rejected: `PENDING → PAUSED` is not allowed |
| Prohibited text | `stolen` was rejected with `PROHIBITED_CONTENT` |
| Photo upload | A real PNG returned 500 `Upload failed`. A text file was rejected as `UNSUPPORTED_TYPE`. Production has no object storage, so the app tries to write into the deployment filesystem |

## Accounts and admin

| Check | Result |
|---|---|
| Seller, dealer, moderator, and super-admin sign-in | Pass |
| Forgot-password | 200 with the same message for an unknown address and a real account. No email provider is connected, so the reset link is not delivered |
| Bad reset token | `INVALID_TOKEN`. The seller password was not changed |
| Anonymous admin API | 401 |
| Seller opening admin or another owner's listing | 403 |
| Moderator suspend, audit log, and content admin | 403 |
| Super-admin dashboard, reports, and content list | 200. Five content pages load. Copy was not edited |
| Notifications | `LISTING_SUBMITTED`, `LISTING_APPROVED`, `REPORT_RESOLVED`, and `PAYMENT_RESULT` arrived |

## Language and layout

| Check | Result |
|---|---|
| English | `dir=ltr`, AED prices |
| Arabic | `dir=rtl`, Arabic copy, prices such as `52,000 د.إ` |
| Listing date | A posted date is rendered |
| Widths 375, 390, 768, 1280, 1536 | No horizontal overflow on the Arabic listing page |
| Mobile menu label | The button name stays "Menu" in Arabic |

## Release blockers

Photo upload fails on the live site. That blocks a complete listing with images until object storage is connected in Phase 11. The other release checks in this pass did not show a payment bypass, an admin leak, broken Arabic navigation, or a broken search.

OTP remains off. A full password reset cannot be finished until email delivery exists. There are not enough listings to show a second results page.
