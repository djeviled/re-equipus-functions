// send-notification/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_KEY") ?? ""
);

// Mock email sending function (in a real implementation, you would use SendGrid)
async function mockSendEmail(to: string, subject: string, body: string) {
  console.log(`Sending email to ${to} with subject "${subject}"`);
  console.log(`Body: ${body}`);
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true, message: "Email sent successfully" };
}

serve(async (_req) => {
  try {
    // Parse the request body
    const { to, subject, body } = await _req.json();
    
    // Validate input
    if (!to || !subject || !body) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Send the notification email
    const emailResult = await mockSendEmail(to, subject, body);
    
    // Log the notification in Supabase
    const { error: insertError } = await supabase
      .from('notifications')
      .insert({
        recipient_email: to,
        subject: subject,
        body: body,
        status: emailResult.success ? 'sent' : 'failed',
        sent_at: new Date().toISOString()
      });
    
    if (insertError) {
      console.error('Error logging notification:', insertError);
      // We don't return an error here as the email was sent successfully
    }
    
    // Return the result
    return new Response(
      JSON.stringify(emailResult),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});