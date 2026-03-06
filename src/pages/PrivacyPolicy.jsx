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

export default function PrivacyPolicy() {
  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>Privacy Policy</h1>

      <p style={styles.metaBlock}>
        <strong>Epic Rides Platform</strong><br />
        Last Updated: March 4, 2026
      </p>

      <p style={styles.p}>
        Epic Rides Inc. ("Epic Rides," "we," "our," or "us") respects your privacy and is
        committed to protecting the personal information of users of the Epic Rides platform.
      </p>

      <p style={styles.p}>
        This Privacy Policy explains how Epic Rides collects, uses, shares, and protects
        information when you access or use:
      </p>

      <ul style={styles.ul}>
        <li style={styles.li}>the Epic Rides mobile application</li>
        <li style={styles.li}>the Epic Rides website (EpicRidesApp.com)</li>
        <li style={styles.li}>related services, communications, and support tools</li>
      </ul>

      <p style={styles.p}>
        (collectively referred to as the "Platform.")
      </p>

      <p style={styles.p}>
        By creating an account or using the Platform, you acknowledge that you have read
        and understand this Privacy Policy.
      </p>

      <hr style={styles.hr} />

      <div style={styles.section}>
        <h2 style={styles.h2}>1. Company Information</h2>
        <p style={styles.contactBlock}>
          Epic Rides Inc.<br />
          7901 4th Street N, Suite 300<br />
          St. Petersburg, FL 33702<br />
          United States<br />
          Email: support@epicridesapp.com<br />
          Phone: +1 844-422-5525<br />
          Website: EpicRidesApp.com
        </p>
      </div>

      <hr style={styles.hr} />

      <div style={styles.section}>
        <h2 style={styles.h2}>2. Information We Collect</h2>
        <p style={styles.p}>
          Epic Rides collects information necessary to operate the Platform and provide
          services to riders and drivers.
        </p>

        <h3 style={styles.h3}>2.1 Information You Provide</h3>
        <p style={styles.p}>
          When you create an account or use the Platform, you may provide information including:
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}>Name</li>
          <li style={styles.li}>Email address</li>
          <li style={styles.li}>Phone number</li>
          <li style={styles.li}>Profile photo</li>
          <li style={styles.li}>Payment information (processed by third-party processors)</li>
          <li style={styles.li}>Vehicle information (drivers only)</li>
          <li style={styles.li}>Driver license and identity verification documents</li>
          <li style={styles.li}>Ride pickup and destination information</li>
          <li style={styles.li}>Ratings, feedback, and communications</li>
        </ul>

        <h3 style={styles.h3}>2.2 Location Information</h3>
        <p style={styles.p}>Epic Rides collects location data to operate the rideshare service. This may include:</p>
        <ul style={styles.ul}>
          <li style={styles.li}>GPS location</li>
          <li style={styles.li}>Wi-Fi location signals</li>
          <li style={styles.li}>Cell tower location information</li>
        </ul>
        <p style={styles.p}>Location data allows Epic Rides to:</p>
        <ul style={styles.ul}>
          <li style={styles.li}>Match riders with nearby drivers</li>
          <li style={styles.li}>Provide pickup and navigation support</li>
          <li style={styles.li}>Calculate ride distances and fares</li>
          <li style={styles.li}>Support safety features</li>
        </ul>
        <p style={styles.p}>
          Drivers may be required to enable location services while the driver app is active.
        </p>

        <h3 style={styles.h3}>2.3 Automatically Collected Information</h3>
        <p style={styles.p}>
          When you use the Platform, certain information may be collected automatically, including:
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}>Device type and operating system</li>
          <li style={styles.li}>IP address</li>
          <li style={styles.li}>Mobile device identifiers</li>
          <li style={styles.li}>App usage data</li>
          <li style={styles.li}>Crash reports and diagnostics</li>
          <li style={styles.li}>Ride activity and transaction information</li>
        </ul>
        <p style={styles.p}>
          This information helps Epic Rides maintain security, detect fraud, and improve
          platform performance.
        </p>

        <h3 style={styles.h3}>2.4 Information from Third Parties</h3>
        <p style={styles.p}>Epic Rides may receive information from third-party services including:</p>
        <ul style={styles.ul}>
          <li style={styles.li}>Payment processors</li>
          <li style={styles.li}>Background check providers (for driver screening)</li>
          <li style={styles.li}>Mapping and navigation services</li>
          <li style={styles.li}>Analytics providers</li>
          <li style={styles.li}>Identity verification services</li>
        </ul>
        <p style={styles.p}>
          These providers assist in operating the Platform and may process information on our behalf.
        </p>
      </div>

      <hr style={styles.hr} />

      <div style={styles.section}>
        <h2 style={styles.h2}>3. How We Use Information</h2>
        <p style={styles.p}>
          Epic Rides uses collected information to operate, improve, and secure the Platform.
          This includes:
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}>Matching riders with drivers</li>
          <li style={styles.li}>Processing ride requests and payments</li>
          <li style={styles.li}>Facilitating driver payouts</li>
          <li style={styles.li}>Verifying user identity</li>
          <li style={styles.li}>Performing driver background checks where permitted by law</li>
          <li style={styles.li}>Providing customer support</li>
          <li style={styles.li}>Communicating about rides, account updates, and safety notifications</li>
          <li style={styles.li}>Detecting fraud, abuse, and security risks</li>
          <li style={styles.li}>Improving product features and performance</li>
          <li style={styles.li}>Complying with legal obligations</li>
        </ul>
        <p style={styles.p}>
          Epic Rides may also send promotional or informational communications where permitted
          by law. Users may opt out of marketing communications at any time.
        </p>
      </div>

      <hr style={styles.hr} />

      <div style={styles.section}>
        <h2 style={styles.h2}>4. How We Share Information</h2>
        <p style={styles.p}>Epic Rides does not sell personal information.</p>
        <p style={styles.p}>Information may be shared in the following circumstances:</p>

        <h3 style={styles.h3}>4.1 Between Riders and Drivers</h3>
        <p style={styles.p}>
          When a ride is requested, Epic Rides shares information required to complete the ride.
          This may include:
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}>First name</li>
          <li style={styles.li}>Pickup and destination location</li>
          <li style={styles.li}>Phone contact through in-app communication</li>
          <li style={styles.li}>Vehicle and driver details</li>
        </ul>

        <h3 style={styles.h3}>4.2 Service Providers</h3>
        <p style={styles.p}>
          Epic Rides works with trusted vendors to operate the Platform. Examples include:
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}>Payment processors (such as Stripe)</li>
          <li style={styles.li}>Cloud hosting providers</li>
          <li style={styles.li}>Customer support systems</li>
          <li style={styles.li}>Mapping and navigation services</li>
          <li style={styles.li}>Analytics providers</li>
          <li style={styles.li}>Background check providers</li>
        </ul>
        <p style={styles.p}>These vendors only receive information necessary to perform services.</p>

        <h3 style={styles.h3}>4.3 Legal Requirements</h3>
        <p style={styles.p}>Epic Rides may disclose information if required to:</p>
        <ul style={styles.ul}>
          <li style={styles.li}>Comply with laws or legal requests</li>
          <li style={styles.li}>Respond to court orders or subpoenas</li>
          <li style={styles.li}>Protect user safety</li>
          <li style={styles.li}>Investigate fraud or illegal activity</li>
          <li style={styles.li}>Enforce our Terms of Use</li>
        </ul>

        <h3 style={styles.h3}>4.4 Business Transfers</h3>
        <p style={styles.p}>
          If Epic Rides is involved in a merger, acquisition, financing, or sale of assets,
          user information may be transferred as part of the transaction in accordance with
          applicable law.
        </p>
      </div>

      <hr style={styles.hr} />

      <div style={styles.section}>
        <h2 style={styles.h2}>5. Data Retention</h2>
        <p style={styles.p}>Epic Rides retains information for as long as necessary to:</p>
        <ul style={styles.ul}>
          <li style={styles.li}>Provide services</li>
          <li style={styles.li}>Comply with legal obligations</li>
          <li style={styles.li}>Resolve disputes</li>
          <li style={styles.li}>Enforce agreements</li>
        </ul>
        <p style={styles.p}>
          Certain transaction records may be retained for up to seven (7) years to comply
          with financial and regulatory requirements.
        </p>
      </div>

      <hr style={styles.hr} />

      <div style={styles.section}>
        <h2 style={styles.h2}>6. Account Deletion and Data Requests</h2>
        <p style={styles.p}>
          Users may request deletion of their Epic Rides account. Account deletion can be
          requested through:
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}>In-app settings, or</li>
          <li style={styles.li}>By contacting support@epicridesapp.com</li>
        </ul>
        <p style={styles.p}>
          Epic Rides aims to process deletion requests within 30 days, subject to legal or
          regulatory data retention requirements. Certain records may be retained where
          required for:
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}>Fraud prevention</li>
          <li style={styles.li}>Legal compliance</li>
          <li style={styles.li}>Financial reporting</li>
        </ul>
      </div>

      <hr style={styles.hr} />

      <div style={styles.section}>
        <h2 style={styles.h2}>7. User Rights and Choices</h2>
        <p style={styles.p}>
          Users may have certain rights regarding their personal information depending on
          their jurisdiction. These rights may include:
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}>Accessing personal data</li>
          <li style={styles.li}>Requesting corrections</li>
          <li style={styles.li}>Requesting deletion</li>
          <li style={styles.li}>Opting out of marketing communications</li>
        </ul>
        <p style={styles.p}>Requests can be submitted to: support@epicridesapp.com</p>
      </div>

      <hr style={styles.hr} />

      <div style={styles.section}>
        <h2 style={styles.h2}>8. Cookies and Website Tracking</h2>
        <p style={styles.p}>
          EpicRidesApp.com may use cookies and similar technologies to:
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}>Operate website functionality</li>
          <li style={styles.li}>Remember user preferences</li>
          <li style={styles.li}>Measure website performance</li>
          <li style={styles.li}>Analyze usage trends</li>
        </ul>
        <p style={styles.p}>
          Users can manage cookie preferences through their browser settings. Disabling
          cookies may affect website functionality.
        </p>
      </div>

      <hr style={styles.hr} />

      <div style={styles.section}>
        <h2 style={styles.h2}>9. Data Security</h2>
        <p style={styles.p}>
          Epic Rides implements reasonable administrative, technical, and physical safeguards
          to protect personal information. These measures may include:
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}>Encryption</li>
          <li style={styles.li}>Access controls</li>
          <li style={styles.li}>Secure servers</li>
          <li style={styles.li}>Monitoring for unauthorized activity</li>
        </ul>
        <p style={styles.p}>However, no system can guarantee complete security.</p>
      </div>

      <hr style={styles.hr} />

      <div style={styles.section}>
        <h2 style={styles.h2}>10. Children's Privacy</h2>
        <p style={styles.p}>
          The Epic Rides Platform is not intended for individuals under the age of 18.
          Epic Rides does not knowingly collect personal information from minors. If we
          become aware that information from a minor has been collected, we will delete it.
        </p>
      </div>

      <hr style={styles.hr} />

      <div style={styles.section}>
        <h2 style={styles.h2}>11. International Data Transfers</h2>
        <p style={styles.p}>
          Epic Rides operates in the United States. Information may be stored or processed
          on servers located in the United States or other jurisdictions where service
          providers operate. By using the Platform, you consent to such transfers where
          permitted by law.
        </p>
      </div>

      <hr style={styles.hr} />

      <div style={styles.section}>
        <h2 style={styles.h2}>12. Changes to This Privacy Policy</h2>
        <p style={styles.p}>
          Epic Rides may update this Privacy Policy from time to time. If material changes
          occur, we may notify users through:
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}>The mobile application</li>
          <li style={styles.li}>Email notifications</li>
          <li style={styles.li}>Website notices</li>
        </ul>
        <p style={styles.p}>
          Continued use of the Platform after changes become effective constitutes acceptance
          of the updated Privacy Policy.
        </p>
      </div>

      <hr style={styles.hr} />

      <div style={styles.section}>
        <h2 style={styles.h2}>13. Contact Information</h2>
        <p style={styles.p}>
          If you have questions about this Privacy Policy or how your information is handled, contact:
        </p>
        <p style={styles.contactBlock}>
          Epic Rides Inc.<br />
          support@epicridesapp.com<br />
          +1 844-422-5525<br />
          7901 4th Street N, Suite 300<br />
          St. Petersburg, FL 33702<br />
          United States
        </p>
      </div>
    </div>
  );
}