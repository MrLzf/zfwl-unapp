# WeChat Login Design

## Goal

Add WeChat login to the uni-app mobile frontend while preserving the existing tutor onboarding rules. The login modal supports both WeChat mobile-number quick login for new users and silent WeChat login for existing bound accounts.

## Scope

- Update the `zfwl-unapp` frontend only.
- Reuse the existing member auth, WeChat provider, user store, tutor city, and tutor profile APIs.
- Keep SMS login behavior unchanged.
- Target WeChat Mini Program behavior. Existing provider branches for official account and App remain compatible with the shared login handler.

## User Flow

### WeChat Mobile-Number Quick Login

1. User opens the auth modal.
2. User selects tutor identity: parent or teacher.
3. User agrees to the user agreement and privacy policy.
4. User taps the WeChat mobile-number quick-login button and authorizes the mobile number.
5. The frontend resolves the current tutor city and calls `/member/auth/weixin-mini-app-login` with:
   - WeChat phone authorization code
   - WeChat login code
   - social state
   - `tutorRole`
   - `tutorCityCode`
6. The frontend refreshes user information and tutor profile.
7. If the backend did not create a tutor profile, the frontend initializes one through `/tutor/profile/init`.
8. If avatar or nickname is missing, the frontend opens the existing `mpAuthorization` modal. The user can choose a WeChat avatar and enter a nickname manually.

### Silent WeChat Login

1. User selects tutor identity and agrees to the agreements.
2. User taps the WeChat login button.
3. The frontend calls the existing social login provider.
4. The frontend refreshes user information and tutor profile.
5. If the account has no tutor profile, the frontend initializes one using the selected identity and resolved city.
6. If avatar or nickname is missing, the frontend opens the existing `mpAuthorization` modal.

## Components

### `sheep/components/s-auth-modal/s-auth-modal.vue`

- Own the shared WeChat login orchestration.
- Validate agreement status before either WeChat action.
- Validate selected identity before profile initialization.
- Resolve city using the same fallback order as SMS login:
  1. cached tutor city
  2. opened Beijing city
  3. opened hot city
  4. first opened city
- Refresh member info and tutor profile after login.
- Initialize a missing tutor profile.
- Open `mpAuthorization` when avatar or nickname is missing.
- Show clear failure messages when authorization, city resolution, or login fails.

### `sheep/components/s-auth-modal/components/sms-login.vue`

- Continue to own SMS-specific input and SMS login.
- Expose the selected tutor identity to the parent modal so WeChat actions use the same identity choice.
- Keep the name field for SMS login. WeChat login does not require it because nickname is completed after login when needed.

### `sheep/platform/provider/wechat/miniProgram.js`

- Keep the existing `login()` behavior for silent social login.
- Extend `mobileLogin()` to accept extra tutor onboarding fields and forward them to `AuthUtil.weixinMiniAppLogin`.

## Error Handling

- Agreement not accepted: retain the existing shake animation and explanatory toast.
- Identity missing: show `请选择身份`.
- Mobile-number authorization rejected: show `快捷登录失败`.
- No opened tutor city: show `请先选择服务城市`.
- Provider login failure: show `微信登录失败，请稍后重试`.
- Profile initialization failure: leave the auth modal available and do not claim completion.

## Verification

- Confirm formatting with `npm run prettier -- --check` if supported by the installed Prettier CLI; otherwise run `npx prettier --check` for the touched Vue and JavaScript files.
- Verify the WeChat provider forwards tutor onboarding fields.
- Verify SMS login remains functionally unchanged.
- Perform a WeChat Mini Program manual check for:
  - new user mobile-number quick login
  - existing bound-account silent login
  - rejected mobile-number authorization
  - missing avatar or nickname opening `mpAuthorization`

