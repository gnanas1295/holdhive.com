import React, { useState } from 'react';
import { Container, Row, Col, Card, Image } from 'react-bootstrap';
import { motion } from 'framer-motion';

// Define some simple animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
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

const About = () => {
  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Construct the mailto link
    const mailtoLink = `mailto:gnanas1295@gmail.com
      ?subject=Contact from ${encodeURIComponent(formData.name)}
      &body=Name: ${encodeURIComponent(formData.name)}%0D%0A
             Email: ${encodeURIComponent(formData.email)}%0D%0A%0D%0A
             Message: ${encodeURIComponent(formData.message)}`;

    // Open user's default email client
    window.location.href = mailtoLink;
  };

  return (
    <Container className="my-5">
      {/* Page Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="text-center mb-5"
      >
        <h1 className="fw-bold">About Us</h1>
        <p className="text-muted">
          Transforming underused spaces into convenient, secure storage solutions.
        </p>
      </motion.div>

      {/* Intro Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="mb-4"
      >
        <p className="text-center">
          <strong>Welcome to HoldHive</strong>, a peer-to-peer marketplace dedicated
          to transforming <strong>underused spaces</strong> into convenient, secure
          storage solutions. Founded on the principle that <strong>collaboration</strong>
          and <strong>resource sharing</strong> can benefit both Hosts and Renters,
          HoldHive aims to simplify how you find, list, and manage storage spaces.
        </p>
      </motion.div>

      {/* Mission & How It Works */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        variants={staggerContainer}
        viewport={{ once: true, amount: 0.2 }}
      >
        <Row className="my-5">
          <Col
            md={6}
            as={motion.div}
            variants={fadeInUp}
            className="d-flex flex-column justify-content-center"
          >
            <h3 className="fw-bold">Our Mission</h3>
            <p>
              We want to <strong>empower communities</strong> by connecting
              those who have space to spare with those seeking affordable,
              flexible storage. By fostering trust through{' '}
              <strong>user profiles</strong>, <strong>reviews</strong>, and
              <strong>transparent communication</strong>, we help ensure every
              storage experience is smooth and worry-free.
            </p>
          </Col>
          <Col md={6} as={motion.div} variants={fadeInUp}>
            <h3 className="fw-bold">How It Works</h3>
            <ol>
              <li>
                <strong>List a Space</strong>: Hosts create a listing with
                location, size, and photos.
              </li>
              <li>
                <strong>Find Storage</strong>: Renters browse and filter
                available listings, then message the Host to confirm details.
              </li>
              <li>
                <strong>Book &amp; Store</strong>: Once both parties agree,
                Renters move items in. All communications stay centralized
                for clarity.
              </li>
            </ol>
          </Col>
        </Row>
      </motion.div>

      {/* Why HoldHive & Our Vision */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        variants={staggerContainer}
        viewport={{ once: true, amount: 0.2 }}
      >
        <Row className="my-5">
          <Col
            md={6}
            as={motion.div}
            variants={fadeInUp}
            className="mb-4 mb-md-0"
          >
            <h3 className="fw-bold">Why HoldHive?</h3>
            <ul>
              <li>
                <strong>Community-Centric</strong>: We embrace a sharing economy,
                allowing everyday people to earn extra income or save on
                traditional storage costs.
              </li>
              <li>
                <strong>User-Friendly</strong>: Our platform focuses on simplicity,
                transparent listings, and a secure messaging system.
              </li>
              <li>
                <strong>Reviews &amp; Ratings</strong>: Honest feedback from our
                community helps everyone choose storage spaces they can trust.
              </li>
              <li>
                <strong>Scalability &amp; Adaptability</strong>: As user needs
                grow, so will our features—like optional host insurance details
                and advanced analytics.
              </li>
            </ul>
          </Col>

          <Col md={6} as={motion.div} variants={fadeInUp}>
            <h3 className="fw-bold">Our Vision</h3>
            <p>
              We see a future where <strong>unused garages</strong>,
              <strong> basements</strong>, and <strong>spare rooms</strong>
              become part of a thriving storage network. By repurposing these
              overlooked spaces, we reduce waste, encourage responsible resource
              use, and foster a supportive community built on mutual benefit.
            </p>
          </Col>
        </Row>
      </motion.div>

      {/* Developer Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        variants={fadeInUp}
        viewport={{ once: true, amount: 0.2 }}
        className="my-5 text-center"
      >
        <Card className="shadow border-0">
          <Card.Body>
            <Row className="g-4 align-items-center">
              <Col md={4} className="text-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image
                    width={120}
                    height={120}
                    src="/gnana.jpeg" // Replace with developer photo URL
                    roundedCircle
                    alt="Developer"
                  />
                </motion.div>
              </Col>
              <Col md={8} className="text-md-start">
                <h4 className="fw-bold">Meet the Developer</h4>
                <p className="mb-2">
                  <strong>HoldHive</strong> was developed by{' '}
                  <strong>Gnanasekar Mani</strong>, who believes in
                  leveraging technology to build more collaborative and
                  sustainable communities.
                </p>
                <p className="mb-2">
                  <strong>LinkedIn</strong>:{' '}
                  <a
                    href="https://www.linkedin.com/in/gnanasekarmani/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://www.linkedin.com/in/gnanasekarmani/
                  </a>
                </p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Closing Statement + CTA */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="text-center"
      >
        <p>
          Whether you’re a <strong>Host</strong> looking to unlock the potential
          of your extra space or a <strong>Renter</strong> seeking convenient,
          cost-effective storage, <strong>HoldHive</strong> is here to streamline
          your journey. Thank you for joining us—together, we’re making storage
          simpler, smarter, and more collaborative.
        </p>
      </motion.div>

      {/* Contact Us Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        variants={fadeInUp}
        viewport={{ once: true, amount: 0.2 }}
        className="my-5"
      >
        <Row className="justify-content-center">
          <Col md={6}>
            <h3 className="fw-bold mb-4 text-center">Contact Us</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="contactName" className="form-label">
                  Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="contactName"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="contactEmail" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="contactEmail"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="contactMessage" className="form-label">
                  Message
                </label>
                <textarea
                  className="form-control"
                  id="contactMessage"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="btn btn-warning w-100">
                Send
              </button>
            </form>
          </Col>
        </Row>
      </motion.div>
    </Container>
  );
};

export default About;
