# Email Notification Setup

## Environment Variables Required

Add the following environment variable to your `.env` or `.env.local` file:

```bash
# Email Service (Resend)
RESEND_API_KEY="re_your_resend_api_key_here"
```

## Resend Setup

1. Go to [Resend.com](https://resend.com) and create an account
2. Create a new API key in your dashboard
3. Add the API key to your environment variables
4. Verify your domain (admin@samedayramps.com and quotes@samedayramps.com)

## Email Notifications

The system sends two types of emails:

### 1. Admin Notifications
- Sent when a new quote is created
- Goes to: `ty@samedayramps.com`
- Includes customer details and quote information
- Urgent quotes get "URGENT -" prefix in the subject
- Professional formatting with clear sections

### 2. Customer Quote Emails
- Sent when quote status changes to "QUOTED"
- Goes to the customer's email address
- Includes pricing details and next steps
- Professional quote format

## Testing

If `RESEND_API_KEY` is not configured, the system will:
- Log a message to console
- Skip sending emails
- Continue normal operation

## Email Templates

Both emails use professional plain text format optimized for spam filter compliance. The templates include:

- Clear section headers and formatting
- Complete customer and project information
- Detailed pricing breakdown (when available)
- Professional contact information and branding
- Clear next steps and call-to-action
- No emojis or special characters that trigger spam filters

## Troubleshooting

- Check console logs for email sending errors
- Verify API key is correct
- Ensure domains are verified in Resend
- Check spam folders for test emails 