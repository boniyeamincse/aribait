/** Shared branded HTML wrapper for transactional emails. Email clients
 * don't load external stylesheets, so everything here is inline. */
export function renderEmailHtml(params: {
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
}) {
  const { heading, bodyHtml, ctaLabel, ctaUrl, footerNote } = params;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${heading}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px;background:linear-gradient(135deg,#3b82f6,#16a34a);">
                <span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">Ariba IT</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#0f172a;">${heading}</h1>
                <div style="font-size:14px;line-height:1.6;color:#334155;">${bodyHtml}</div>
                ${
                  ctaLabel && ctaUrl
                    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 8px;">
                        <tr>
                          <td style="border-radius:10px;background:linear-gradient(135deg,#3b82f6,#16a34a);">
                            <a href="${ctaUrl}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">${ctaLabel}</a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;word-break:break-all;">
                        Or paste this link into your browser:<br />
                        <a href="${ctaUrl}" style="color:#3b82f6;">${ctaUrl}</a>
                      </p>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
                <p style="margin:0;font-size:12px;color:#94a3b8;">
                  ${footerNote ?? "Bangladesh's live IT and cybersecurity training platform."}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
