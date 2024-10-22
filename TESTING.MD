# Testing

> [!NOTE]  
> Return back to the [README.md](README.md) file.

## Code Validation

### HTML

I have used the recommended [HTML W3C Validator](https://validator.w3.org) to validate all of my HTML files.

| Page | Screenshot | Notes |
| ---  | --- | --- |
| Home  | ![screenshot](src/assets/documentation/validation/html_home.png) | |
| Profile  | ![screenshot](src/assets/documentation/validation/html_profile.png) | |

### CSS

I have used the recommended [CSS Jigsaw Validator](https://jigsaw.w3.org/css-validator) to validate all of my CSS files.

| Page  | Screenshot | Notes |
| ---  | --- | --- |
| Home | ![screenshot](src/assets/documentation/validation/css_home.png) | |
| Profile | ![screenshot](src/assets/documentation/validation/css_profile.png) | |

## Browser Compatibility

I've tested my deployed project on multiple browsers to check for compatibility issues.

| Browser | Home | profile | Posts  | Note
| --- | --- | --- | --- | --- |
| Chrome | ![screenshot](src/assets/documentation/browsers/home_chrome.png) | ![screenshot](src/assets/documentation/browsers/profile_chrome.png) | ![screenshot](src/assets/documentation/browsers/posts_chrome.png)  | Works as expected |
| Firefox | ![screenshot](src/assets/documentation/browsers/home_fire.png) | ![screenshot](src/assets/documentation/browsers/profile_fire.png) | ![screenshot](src/assets/documentation/browsers/posts_fire.png) | Works as expected |
| Safari | ![screenshot](src/assets/documentation/browsers/home_safari.png) | ![screenshot](src/assets/documentation/browsers/profile_safari.png) | ![screenshot](src/assets/documentation/browsers/posts_safari.png) | Works as expected |

## Responsiveness

I've tested my deployed project on multiple devices to check for responsiveness issues.

| Device | Home | Profile | Posts | Notes |
| --- | --- | --- | --- | --- |
| Mobile (DevTools) | ![screenshot](src/assets/documentation/responsiveness/mob_h.png) | ![screenshot](src/assets/documentation/responsiveness/mob_pr.png) | ![screenshot](src/assets/documentation/responsiveness/mob_po.png) | Works as expected |
| Tablet (DevTools) | ![screenshot](src/assets/documentation/responsiveness/tab_h.png)  | ![screenshot](src/assets/documentation/responsiveness/tab_pr.png) | ![screenshot](src/assets/documentation/responsiveness/tab_po.png) | Works as expected |
| Desktop | ![screenshot](src/assets/documentation/browsers/home_chrome.png) | ![screenshot](src/assets/documentation/browsers/profile_chrome.png) | ![screenshot](src/assets/documentation/browsers/posts_chrome.png) | Works as expected |

## Lighthouse Audit

I've tested my deployed project using the Lighthouse Audit tool to check accessibility.

| Page | Mobile | Desktop | Notes |
| --- | --- | --- | --- |
| Home | ![screenshot](src/assets/documentation/lighthouse/lighthouse_h_m.png) | ![screenshot](src/assets/documentation/lighthouse/lighthouse_h_d.png) | Some minor warnings |
| Profile | ![screenshot](src/assets/documentation/lighthouse/lighthouse_pr_m.png) | ![screenshot](src/assets/documentation/lighthouse/lighthouse_pr_d.png) | Slow response time due to large images |

## Defensive Programming

Defensive programming was manually tested with the below user acceptance testing:

| Page | Expectation | Test | Result | Fix | Screenshot |
| --- | --- | --- | --- | --- | --- |
| Sign in | | | | | |
| | Users should not be able to submit an empty form | Attempted to submit form with empty fields | Form submission was prevented and error messages were displayed | Test concluded and passed | ![screenshot](src/assets/documentation/features/def_in_balnk.png) |
| | Users should see an error message for incorrect credentials | Entered incorrect username/password | An error message was displayed indicating invalid credentials | Test concluded and passed | ![screenshot](src/assets/documentation/features/def_in_wrong.png) |
| Sign up | | | | | |
| | Users should not be able to sign up with a username that already exists | Attempted to create an account with an existing username | An error message was displayed indicating the username is taken | Test concluded and passed | ![screenshot](src/assets/documentation/features/def_up_same.png) |
| | Passwords should be required to match | Entered mismatching passwords in the password and confirm password fields | An error message was displayed indicating passwords do not match | Test concluded and passed | ![screenshot](src/assets/documentation/features/def_up_pass.png) |
| Create Post | | | | | |
| | Users should not be able to create a post with an image larger than 2 MB| Attempted to submit a post with an larg image | Form submission was prevented and an error message was displayed | Test concluded and passed | ![screenshot](src/assets/documentation/features/def_larg_img.png) |


## User Story Testing

| User Story | Screenshot |
| --- | --- |
| As a new site user, I want to register for an account, so that I can access the platform's features. | ![screenshot](src/assets/documentation/features/up.png) |
| As a returning site user, I want to log in to my account, so that I can access my personalized content and interactions. | ![screenshot](src/assets/documentation/features/in.png) |
| As a user, I want to create a new post with a photo and description, so that I can share my woodworking projects with the community. | ![screenshot](src/assets/documentation/features/add.png) |
| As a user, I want to view the details of a specific post, so that I can get more information about a project and engage with it. | ![screenshot](src/assets/documentation/features/dpost.png) |
| As a user, I want to like posts to show my appreciation for other users' work. | ![screenshot](src/assets/documentation/features/like_com.png) |
| As a logged-in user, I want to add comments to a post, so that I can share my thoughts and engage in discussions about the projects. | ![screenshot](src/assets/documentation/features/like_com.png) |

## Bugs
**Bugs**

* Follow Status Update Error: 401 (Unauthorized)

  * The follow/unfollow functionality was failing with a 401 error when trying to update follow status. Looking at the network tab, the issue was related to token expiration and authorization headers not being properly set for the request.
  * To fix this, I implemented proper token refresh handling in the authService and updated the follow action to include the correct authorization headers.

  ![Follow Error](src/assets/documentation/bugs/follow_error.png)

* Invalid Professional ID or Advertisement ID Error: 400 (Bad Request)

  * When attempting to create a job offer, the system was failing to properly pass the professional ID and advertisement ID to the backend. The error occurred because the IDs were not being correctly extracted from the URL parameters.
  * Fixed by updating the JobOfferForm component to correctly parse and handle URL parameters, and ensuring the backend validation was properly checking for these required fields.

  ![Job Offer Error](src/assets/documentation/bugs/job_offer_error.png)

* Multiple Failed Like Requests: 401 (Unauthorized)

  * Multiple simultaneous like requests were failing with 401 errors. The network tab showed multiple failed XHR requests to the likes endpoint for different posts.
  * The solution involved implementing proper request debouncing and fixing the authorization token handling in the likeService to prevent multiple failed requests.

  ![Like Requests Error](src/assets/documentation/bugs/like_requests_error.png)

* Categories Map TypeError: Runtime Error

  * A runtime error occurred when trying to map over categories in the PostForm component. The error "categories.map is not a function" indicated that the categories data structure wasn't properly initialized.
  * Fixed by ensuring the categories state was properly initialized as an array and handling the case where categories data might be null or undefined.

  ![Categories Error](src/assets/documentation/bugs/categories_error.png)

* Network Error on Post Creation: ERR_NETWORK

  * Post creation was failing with a network error. The console showed an Axios error with "ERR_NETWORK" when attempting to create a new post with an image.
  * The fix involved properly configuring the multipart/form-data content type headers and ensuring the image upload was correctly handled in the form submission process.

  ![Post Creation Error](src/assets/documentation/bugs/post_creation_error.png)
  

## Unfixed Bugs
  
> There are no remaining bugs that I am aware of.
