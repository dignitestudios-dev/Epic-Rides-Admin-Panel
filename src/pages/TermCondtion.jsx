import React from "react";

const styles = {
  page: {
    margin: "0 auto",
    padding: "48px 40px",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    fontSize: "16px",
    lineHeight: "1.7",
    color: "#1a1a1a",
    backgroundColor: "#fff",
  },
  h1: {
    fontSize: "28px",
    fontWeight: "700",
    lineHeight: "1.2",
    marginBottom: "16px",
    marginTop: "0",
    letterSpacing: "-0.3px",
  },
  metaBlock: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#555",
    marginBottom: "8px",
  },
  contactBlock: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#333",
    marginTop: "16px",
    marginBottom: "0",
  },
  hr: {
    border: "none",
    borderTop: "1px solid #ddd",
    margin: "32px 0",
  },
  h2: {
    fontSize: "20px",
    fontWeight: "700",
    lineHeight: "1.3",
    marginTop: "0",
    marginBottom: "12px",
    letterSpacing: "-0.2px",
  },
  h3: {
    fontSize: "17px",
    fontWeight: "600",
    lineHeight: "1.3",
    marginTop: "24px",
    marginBottom: "10px",
  },
  p: {
    fontSize: "16px",
    lineHeight: "1.7",
    marginTop: "0",
    marginBottom: "12px",
    color: "#1a1a1a",
  },
  ul: {
    paddingLeft: "24px",
    marginTop: "4px",
    marginBottom: "12px",
  },
  li: {
    fontSize: "16px",
    lineHeight: "1.7",
    marginBottom: "4px",
    color: "#1a1a1a",
  },
  section: {
    marginBottom: "0",
  },
};

export default function TermCondition() {
  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>Terms of Use</h1>

      <p style={styles.metaBlock}>
        <strong>Epic Rides Platform</strong>
        <br />
        Version 2.1
        <br />
        Effective Date: February 7, 2026
        <br />
        Last Updated: March 2, 2026
      </p>

      <p style={styles.p}>
        Epic Rides Inc. ("Epic Rides," "we," "our," or "us") operates a
        technology platform that connects riders with independent drivers.
      </p>

      <p style={styles.p}>
        These Terms of Use ("Terms") govern access to and use of the Epic Rides
        mobile application, website, and related services (collectively, the
        "Platform").
      </p>

      <p style={styles.p}>
        By creating an account or using the Platform, you agree to these Terms.
      </p>

      <p style={styles.contactBlock}>
        Contact:
        <br />
        support@epicridesapp.com
        <br />
        +1 844-422-5525
      </p>

      <hr style={styles.hr} />

      <div style={styles.section}>
        <h2 style={styles.h2}>1. Platform Role</h2>
        <p style={styles.p}>
          Epic Rides provides a technology platform that enables riders and
          drivers to connect.
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}>Does not provide transportation services</li>
          <li style={styles.li}>Does not employ drivers</li>
          <li style={styles.li}>
            Does not control driver vehicles, routes, or driving conduct
          </li>
        </ul>
        <p style={styles.p}>
          Drivers operate as independent contractors responsible for their own
          compliance with applicable laws, licensing requirements, insurance,
          and operational safety.
        </p>
        <p style={styles.p}>Epic Rides is not a common carrier.</p>
      </div>

      <hr style={styles.hr} />

      <div style={styles.section}>
        <h2 style={styles.h2}>2. Eligibility</h2>
        <p style={styles.p}>
          Users must be at least <strong>18 years old</strong> to create an
          account.
        </p>
        <p style={styles.p}>
          Drivers must meet all eligibility requirements displayed in the driver
          onboarding process.
        </p>
      </div>

      <hr style={styles.hr} />

      <div style={styles.section}>
        <h2 style={styles.h2}>3. User Accounts</h2>
        <p style={styles.p}>
          Users must provide accurate account information and maintain the
          confidentiality of login credentials.
        </p>
        <p style={styles.p}>
          Epic Rides may require identity verification, background screening for
          drivers, and additional verification measures where permitted by law.
        </p>
        <p style={styles.p}>
          Users are responsible for all activity that occurs under their
          account.
        </p>
      </div>

      <hr style={styles.hr} />

      <div style={styles.section}>
        <h2 style={styles.h2}>4. Safety and Conduct</h2>
        <p style={styles.p}>Users agree not to:</p>
        <ul style={styles.ul}>
          <li style={styles.li}>Violate laws or regulations</li>
          <li style={styles.li}>Harass or discriminate against others</li>
          <li style={styles.li}>Engage in fraudulent or illegal activity</li>
          <li style={styles.li}>Damage property</li>
          <li style={styles.li}>Use the platform in unsafe or abusive ways</li>
        </ul>
        <p style={styles.p}>
          Epic Rides may suspend or deactivate accounts that violate these Terms
          or create safety risks.
        </p>
      </div>

      <hr style={styles.hr} />

      <div style={styles.section}>
        <h2 style={styles.h2}>5. Rides, Fares, and Payments</h2>
        <p style={styles.p}>
          When a ride is requested, the Platform may display estimated fares and
          arrival times.
        </p>
        <p style={styles.p}>Actual fares may vary based on:</p>
        <ul style={styles.ul}>
          <li style={styles.li}>Distance</li>
          <li style={styles.li}>Time</li>
          <li style={styles.li}>Route changes</li>
          <li style={styles.li}>Traffic conditions</li>
          <li style={styles.li}>Tolls or applicable adjustments</li>
        </ul>
        <p style={styles.p}>
          Riders authorize Epic Rides or its payment processors to charge the
          payment method on file for all applicable fares and fees.
        </p>
        <p style={styles.p}>
          Drivers are responsible for their own tax obligations.
        </p>
        <p style={styles.p}>Epic Rides does not withhold taxes for drivers.</p>
      </div>

      <hr style={styles.hr} />

      <div style={styles.section}>
        <h2 style={styles.h2}>
          6. Fees, Withdrawals &amp; Driver Subscription Terms
        </h2>

        <h3 style={styles.h3}>6.1 Payment Processing &amp; Card Fees</h3>
        <p style={styles.p}>
          Payouts and withdrawals processed through the Epic Rides Platform are
          subject to the following fees:
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}>
            <strong>3% platform withdrawal fee</strong> per withdrawal
          </li>
          <li style={styles.li}>
            <strong>3% payment processing fee</strong> via third-party
            processors (e.g., Stripe)
          </li>
        </ul>
        <p style={styles.p}>
          These fees are automatically deducted when a withdrawal or payout is
          processed.
        </p>

        <h3 style={styles.h3}>
          6.2 Driver Subscription Fee (Driver Accounts Only)
        </h3>
        <p style={styles.p}>
          Drivers using the Epic Rides Platform must maintain an active
          subscription.
        </p>
        <p style={styles.p}>
          <strong>$25 per week (flat fee)</strong>
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}>Access to the Epic Rides Driver Platform</li>
          <li style={styles.li}>Access to the driver mobile application</li>
          <li style={styles.li}>Ride request and earnings functionality</li>
          <li style={styles.li}>No hidden platform commissions</li>
        </ul>
        <p style={styles.p}>
          Epic Rides does <strong>not take a percentage of driver fares</strong>
          .
        </p>
        <p style={styles.p}>
          Drivers retain <strong>100% of ride fares</strong>, subject only to
          the processing and withdrawal fees.
        </p>

        <h3 style={styles.h3}>6.3 No Hidden Charges</h3>
        <p style={styles.p}>
          Epic Rides operates under a transparent pricing model.
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}>3% withdrawal fee</li>
          <li style={styles.li}>Third-party processing fee</li>
          <li style={styles.li}>$25 weekly driver subscription</li>
        </ul>
        <p style={styles.p}>
          Epic Rides does not charge hidden commissions or recurring platform
          charges.
        </p>
      </div>

      <hr style={styles.hr} />

      <div style={styles.section}>
        <h2 style={styles.h2}>7. Promotions</h2>
        <p style={styles.p}>
          Epic Rides may offer promotions, referral incentives, discounts, or
          credits. These promotions may be modified or discontinued at any time.
        </p>
      </div>

      <hr style={styles.hr} />

      <div style={styles.section}>
        <h2 style={styles.h2}>8. Intellectual Property</h2>
        <p style={styles.p}>
          All Epic Rides trademarks, branding, software, and platform technology
          remain the property of Epic Rides Inc.
        </p>
        <p style={styles.p}>
          Users receive a limited, non-exclusive license to use the platform for
          its intended purposes.
        </p>
      </div>

      <hr style={styles.hr} />

      <div style={styles.section}>
        <h2 style={styles.h2}>9. Account Suspension or Deactivation</h2>
        <p style={styles.p}>
          Accounts may be suspended or deactivated if users:
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}>Violate these Terms</li>
          <li style={styles.li}>Create safety risks</li>
          <li style={styles.li}>Engage in fraud or abuse</li>
          <li style={styles.li}>Misuse the platform</li>
        </ul>
      </div>

      <hr style={styles.hr} />

      <div style={styles.section}>
        <h2 style={styles.h2}>10. Disclaimer of Warranties</h2>
        <p style={styles.p}>
          The Platform is provided "as-is" and "as-available." Epic Rides makes
          no warranties regarding:
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}>Ride availability</li>
          <li style={styles.li}>Uninterrupted service</li>
          <li style={styles.li}>Platform accuracy</li>
          <li style={styles.li}>Driver behavior or performance</li>
        </ul>
      </div>

      <hr style={styles.hr} />

      <div style={styles.section}>
        <h2 style={styles.h2}>11. Limitation of Liability</h2>
        <p style={styles.p}>
          To the maximum extent permitted by law, Epic Rides' total liability
          will not exceed <strong>$100 USD</strong>.
        </p>
        <p style={styles.p}>
          Epic Rides is not liable for indirect or consequential damages.
        </p>
      </div>

      <hr style={styles.hr} />

      <div style={styles.section}>
        <h2 style={styles.h2}>12. Arbitration &amp; Governing Law</h2>
        <p style={styles.p}>
          These Terms are governed by the laws of the{" "}
          <strong>State of Florida</strong>.
        </p>
        <p style={styles.p}>
          Disputes will be resolved through{" "}
          <strong>binding arbitration in Miami-Dade County, Florida</strong>.
        </p>
        <p style={styles.p}>
          Users waive the right to jury trial and class actions where permitted
          by law.
        </p>
      </div>

      <hr style={styles.hr} />

      <div style={styles.section}>
        <h2 style={styles.h2}>13. Changes to Terms</h2>
        <p style={styles.p}>Epic Rides may update these Terms periodically.</p>
        <p style={styles.p}>
          Continued use of the Platform constitutes acceptance of updated Terms.
        </p>
      </div>

      <hr style={styles.hr} />

      <div style={styles.section}>
        <h2 style={styles.h2}>14. Contact</h2>
        <p style={styles.p}>
          Epic Rides Inc.
          <br />
          support@epicridesapp.com
          <br />
          +1 844-422-5525
        </p>
      </div>
    </div>
  );
}
