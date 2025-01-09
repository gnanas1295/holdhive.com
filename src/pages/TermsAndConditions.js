import React from 'react';
import { Container } from 'react-bootstrap';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const staggerContainer = {
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const TermsAndConditions = () => {
  return (
    <Container className="my-5">
      {/* Page Heading */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="text-center mb-4"
      >
        <h1 className="fw-bold">Terms and Conditions</h1>
        <p className="text-muted">Effective Date: 01/January/2025</p>
      </motion.div>

      {/* Terms Content */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        variants={staggerContainer}
        viewport={{ once: true, amount: 0.1 }} // Animations trigger once
      >
        {/* Section 1 */}
        <motion.section variants={fadeInUp} className="mb-5">
          <h2 className="fw-bold">Welcome to HoldHive</h2>
          <p>
            By accessing or using our website and services, you agree to comply
            with and be bound by the following Terms and Conditions (“Terms”).
            If you do not agree with these Terms, please do not use the Platform.
          </p>
        </motion.section>

        {/* Section 2 */}
        <motion.section variants={fadeInUp} className="mb-5">
          <h3>1. Definitions</h3>
          <ul>
            <li>
              <strong>“HoldHive,” “we,” “our,” or “us”</strong>: Refers to
              the owners, operators, and administrators of the HoldHive platform.
            </li>
            <li>
              <strong>“User,” “you,” or “your”</strong>: Refers to any individual
              or entity accessing or using the Platform, including both
              <strong> Hosts</strong> and <strong>Renters</strong>.
            </li>
            <li>
              <strong>“Listing”</strong>: Any space or storage offering posted
              on the Platform by a Host.
            </li>
            <li>
              <strong>“Agreement”</strong>: This document, along with our Privacy
              Policy, forms the entire agreement between you and HoldHive.
            </li>
          </ul>
        </motion.section>

        {/* Section 3 */}
        <motion.section variants={fadeInUp} className="mb-5">
          <h3>2. Eligibility</h3>
          <ul>
            <li>You must be <strong>18 years or older</strong> to register and use the Platform.</li>
            <li>
              By creating an account, you warrant that all information you provide
              is accurate, current, and complete.
            </li>
            <li>
              The Platform may be used only in compliance with applicable laws
              and regulations.
            </li>
          </ul>
        </motion.section>

        {/* Section 4 */}
        <motion.section variants={fadeInUp} className="mb-5">
          <h3>3. User Accounts</h3>
          <ul>
            <li>
              <strong>Registration:</strong> You agree to provide and maintain
              accurate and complete information.
            </li>
            <li>
              <strong>Security:</strong> You are responsible for maintaining the
              confidentiality of your login credentials.
            </li>
            <li>
              <strong>Account Termination:</strong> We reserve the right to suspend
              or terminate your account for violations.
            </li>
          </ul>
        </motion.section>

        {/* Section 5 */}
        <motion.section variants={fadeInUp} className="mb-5">
          <h3>4. Listings and Space Usage</h3>
          <ul>
            <li>
              <strong>Host Responsibilities:</strong> Provide accurate space
              details and maintain safety and accessibility.
            </li>
            <li>
              <strong>Renter Responsibilities:</strong> Use the space exclusively
              for permitted items and comply with Host rules.
            </li>
          </ul>
        </motion.section>

        {/* Section 6 */}
        <motion.section variants={fadeInUp} className="mb-5">
          <h3>5. Insurance and Liability</h3>
          <ul>
            <li>
              <strong>No Insurance Provided:</strong> HoldHive does not provide
              insurance coverage; Users must arrange their own.
            </li>
            <li>
              <strong>Indemnity:</strong> You agree to release and indemnify
              HoldHive from claims or damages arising from disputes.
            </li>
          </ul>
        </motion.section>

        {/* Section 7 */}
        <motion.section variants={fadeInUp} className="mb-5">
          <h3>6. Prohibited Activities</h3>
          <ul>
            <li>
              Storage of illegal, hazardous, or restricted items is strictly prohibited.
            </li>
            <li>
              Hosts may not list spaces that are illegally acquired or trespassed.
            </li>
            <li>Fraudulent or deceptive behavior is prohibited.</li>
          </ul>
        </motion.section>

        {/* Section 8 */}
        <motion.section variants={fadeInUp} className="mb-5">
          <h3>7. Intellectual Property</h3>
          <ul>
            <li>
              All content on the Platform is the property of HoldHive or its
              licensors. Unauthorized use is prohibited.
            </li>
          </ul>
        </motion.section>

        {/* Section 9 */}
        <motion.section variants={fadeInUp} className="mb-5">
          <h3>8. Disputes and Conflict Resolution</h3>
          <ul>
            <li>
              Users should attempt to resolve disputes directly before seeking
              Platform assistance.
            </li>
            <li>
              Unresolved disputes may proceed under applicable laws of the
              jurisdiction where HoldHive operates.
            </li>
          </ul>
        </motion.section>

        {/* Section 10 */}
        <motion.section variants={fadeInUp} className="mb-5">
          <h3>9. User Reviews and Ratings</h3>
          <ul>
            <li>Users are encouraged to leave fair and accurate reviews.</li>
            <li>HoldHive may remove vulgar or inappropriate reviews.</li>
          </ul>
        </motion.section>

        {/* Section 11 */}
        <motion.section variants={fadeInUp} className="mb-5">
          <h3>10. Modification or Termination of Services</h3>
          <ul>
            <li>We may modify or discontinue the Platform at any time, with or without notice.</li>
            <li>
              Changes to these Terms will be communicated and continued use signifies
              acceptance.
            </li>
          </ul>
        </motion.section>

        {/* Section 12 */}
        <motion.section variants={fadeInUp} className="mb-5">
          <h3>11. Governing Law and Jurisdiction</h3>
          <ul>
            <li>These Terms are governed by the laws of [your jurisdiction].</li>
          </ul>
        </motion.section>

        {/* Section 13 */}
        <motion.section variants={fadeInUp} className="mb-5">
          <h3>12. Disclaimer and Limitation of Liability</h3>
          <ul>
            <li>
              HoldHive is provided on an “as is” basis without warranties of any kind.
            </li>
            <li>We are not liable for indirect or consequential damages.</li>
          </ul>
        </motion.section>

        {/* Section 14 */}
        <motion.section variants={fadeInUp} className="mb-5">
          <h3>13. Contact Us</h3>
          <ul>
            <li>Email: <a href="mailto:gnanas1295@gmail.com">gnanas1295@gmail.com</a></li>
            <li>Address: Dublin, Ireland</li>
          </ul>
        </motion.section>

        {/* Final Acknowledgment */}
        <motion.section variants={fadeInUp} className="text-center">
          <p className="text-muted">
            By using HoldHive, you acknowledge that you have read, understood,
            and agree to these Terms.
          </p>
        </motion.section>
      </motion.div>
    </Container>
  );
};

export default TermsAndConditions;
