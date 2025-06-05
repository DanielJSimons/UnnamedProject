"use client";

import React from 'react';
import { CheckIcon } from '@radix-ui/react-icons';
import styles from './page.module.scss';

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
}

const PricingCard: React.FC<PricingTier> = ({
  name,
  price,
  description,
  features,
  buttonText,
  isPopular
}) => (
  <div className={`${styles.pricingCard} ${isPopular ? styles.popular : ''}`}>
    {isPopular && <div className={styles.popularBadge}>Most Popular</div>}
    <h3>{name}</h3>
    <div className={styles.price}>{price}</div>
    <p className={styles.description}>{description}</p>
    <ul className={styles.features}>
      {features.map((feature, index) => (
        <li key={index}>
          <CheckIcon className={styles.checkIcon} />
          {feature}
        </li>
      ))}
    </ul>
    <a href="/signup" className={styles.button}>
      {buttonText}
    </a>
  </div>
);

export default function PricingPage() {
  const tiers: PricingTier[] = [
    {
      name: "Individual",
      price: "$19/month",
      description: "Perfect for researchers, journalists, and curious minds.",
      features: [
        "Access to all basic analytics",
        "Up to 100 video analyses per month",
        "7-day data history",
        "Basic sentiment analysis",
        "Export data in CSV format",
        "Email support"
      ],
      buttonText: "Start Free Trial"
    },
    {
      name: "Professional",
      price: "$49/month",
      description: "For professionals who need deeper insights and more flexibility.",
      features: [
        "Everything in Individual, plus:",
        "Unlimited video analyses",
        "30-day data history",
        "Advanced sentiment analysis",
        "Custom entity tracking",
        "Priority email support",
        "API access"
      ],
      buttonText: "Start Free Trial",
      isPopular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For organizations requiring comprehensive solutions and dedicated support.",
      features: [
        "Everything in Professional, plus:",
        "Unlimited data history",
        "Custom integrations",
        "Dedicated account manager",
        "Training sessions",
        "24/7 phone support",
        "Custom reporting",
        "SLA guarantees"
      ],
      buttonText: "Contact Sales"
    }
  ];

  return (
    <main className={styles.pricingPage}>
      <div className="container">
        <header className={styles.header}>
          <h1>Simple, Transparent Pricing</h1>
          <h2>Choose the Plan That&apos;s Right for You</h2>
          <p className={styles.intro}>
            All plans come with a 14-day free trial. No credit card required.
            Cancel anytime. Need something specific? Contact us for a custom plan.
          </p>
        </header>

        <section className={styles.pricingGrid}>
          {tiers.map((tier, index) => (
            <PricingCard key={index} {...tier} />
          ))}
        </section>

        <section className={styles.faq}>
          <h2>Frequently Asked Questions</h2>
          <div className={styles.questions}>
            <div className={styles.question}>
              <h3>Can I change plans later?</h3>
              <p>
                Yes, you can upgrade or downgrade your plan at any time. Changes
                take effect at the start of your next billing cycle.
              </p>
            </div>
            <div className={styles.question}>
              <h3>What happens after my trial ends?</h3>
                <p>
                  After your 14-day trial, you&apos;ll be asked to select a plan to
                  continue using Unnamed Project. We&apos;ll send you a reminder before
                  your trial expires.
                </p>
            </div>
            <div className={styles.question}>
              <h3>Do you offer academic discounts?</h3>
              <p>
                Yes! We offer special pricing for academic institutions and
                researchers. Please contact our sales team with your academic
                credentials.
              </p>
            </div>
            <div className={styles.question}>
              <h3>What payment methods do you accept?</h3>
              <p>
                We accept all major credit cards, PayPal, and wire transfers for
                enterprise customers. All payments are processed securely through
                Stripe.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.contact}>
          <h2>Need Something Different?</h2>
          <p>
            Our team is ready to work with you to create a custom solution that
            fits your specific needs and requirements.
          </p>
          <a href="/contact" className={styles.contactButton}>
            Contact Our Sales Team
          </a>
        </section>
      </div>
    </main>
  );
} 