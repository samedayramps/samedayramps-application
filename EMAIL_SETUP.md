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
- Urgent quotes get a 🚨 emoji in the subject

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

Both emails use plain text format for maximum compatibility. The templates include:

- Customer information
- Quote details
- Pricing (when available)
- Contact information
- Next steps

## Troubleshooting

- Check console logs for email sending errors
- Verify API key is correct
- Ensure domains are verified in Resend
- Check spam folders for test emails 