import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Link,
} from '@react-email/components';
import * as React from 'react';

type Props = {
  firstName: string;
  reference: string;
  eventTitle: string;
  eventDates: string;
  eventLocation: string;
  visitTitle?: string | null;
  nightDates?: string[];
  contactEmail: string;
  appUrl: string;
};

export default function ConfirmationEmail({
  firstName,
  reference,
  eventTitle,
  eventDates,
  eventLocation,
  visitTitle,
  nightDates = [],
  contactEmail,
  appUrl,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Votre inscription à {eventTitle} est confirmée — réf. {reference}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={headerBar} />

          <Section style={header}>
            <Text style={brandRed}>cdc <span style={{ color: '#1d1d1b' }}>habitat</span></Text>
            <Text style={brandMeta}>Rencontre Nationale Patrimoine 2026</Text>
          </Section>

          <Section style={hero}>
            <Text style={eyebrow}>● Inscription confirmée</Text>
            <Heading style={h1}>
              Bonjour {firstName}, à très bientôt à Lyon.
            </Heading>
            <Text style={lede}>
              Votre inscription à <strong>{eventTitle}</strong> est bien enregistrée. Nous sommes ravis
              de vous compter parmi nous pour ces deux journées d&apos;échanges et de rencontres. Vous
              recevrez le programme détaillé et les informations pratiques début septembre.
            </Text>
          </Section>

          <Section style={recap}>
            <Text style={recapTitle}>RÉCAPITULATIF</Text>
            <Row label="Référence" value={reference} accent />
            <Row label="Dates" value={eventDates} />
            <Row label="Lieu" value={eventLocation} />
            <Row label="Visite" value={visitTitle || 'Aucune'} />
            <Row
              label="Nuitées"
              value={nightDates.length === 0 ? 'Aucune' : nightDates.join(' & ')}
            />
          </Section>

          <Section style={ctaWrapper}>
            <Button href={appUrl} style={cta}>
              Voir le programme et les infos pratiques
            </Button>
          </Section>

          <Hr style={hr} />

          <Section>
            <Text style={paragraph}>
              <strong>Besoin de modifier votre inscription ?</strong>
              <br />
              Écrivez-nous à <Link href={`mailto:${contactEmail}`} style={link}>{contactEmail}</Link>{' '}
              en précisant votre référence d&apos;inscription. Notre équipe vous répondra dans les
              meilleurs délais.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={signature}>
            <Text style={signatureText}>
              À très bientôt,
              <br />
              <strong>L&apos;équipe Rencontre Nationale Patrimoine 2026</strong>
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              CDC Habitat — GIE Expertise &amp; Support · Direction du Patrimoine Groupe
            </Text>
            <Text style={footerText}>Référence dossier : DPG-SMO-2026-01</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      style={{
        padding: '14px 0',
        borderBottom: '1px solid #D6D8D9',
      }}
    >
      <div
        style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: 11,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: '#828485',
          fontWeight: 600,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: 17,
          fontWeight: 700,
          color: accent ? '#E30613' : '#1d1d1b',
          lineHeight: 1.3,
          wordBreak: 'break-word',
        }}
      >
        {value}
      </div>
    </div>
  );
}

const body = { backgroundColor: '#ECECEC', fontFamily: 'Arial, Helvetica, sans-serif', margin: 0, padding: '20px 0' };
const container = { maxWidth: 580, margin: '0 auto', backgroundColor: '#FFFFFF', borderRadius: 4, overflow: 'hidden' };
const headerBar = { height: 4, backgroundColor: '#E30613', margin: 0 };
const header = { padding: '32px 32px 24px', borderBottom: '1px solid #D6D8D9', marginBottom: 0 };
const brandRed = { fontFamily: 'Arial Black, Arial, sans-serif', fontWeight: 900, fontSize: 20, color: '#E30613', margin: 0, letterSpacing: '-0.02em' };
const brandMeta = { fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#828485', margin: '6px 0 0 0', fontWeight: 500 };
const hero = { padding: '32px 32px 8px' };
const eyebrow = { fontFamily: 'Arial, sans-serif', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' as const, color: '#E30613', fontWeight: 700, margin: 0 };
const h1 = { fontFamily: 'Arial Black, Arial, sans-serif', fontWeight: 800, fontSize: 28, lineHeight: 1.15, color: '#1d1d1b', margin: '16px 0 16px 0', letterSpacing: '-0.02em' };
const lede = { fontFamily: 'Arial, sans-serif', fontSize: 15, lineHeight: 1.6, color: '#4C4C4B', margin: 0 };
const recap = { backgroundColor: '#ECECEC', padding: '20px 24px', margin: '24px 24px', borderRadius: 4, borderLeft: '3px solid #E30613' };
const recapTitle = { fontFamily: 'Arial, sans-serif', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' as const, color: '#828485', fontWeight: 700, margin: '0 0 8px 0' };
const ctaWrapper = { padding: '8px 32px 24px', textAlign: 'center' as const };
const cta = {
  backgroundColor: '#E30613',
  color: '#FFFFFF',
  fontFamily: 'Arial, sans-serif',
  fontWeight: 700,
  fontSize: 15,
  textDecoration: 'none',
  padding: '14px 28px',
  borderRadius: 4,
  display: 'inline-block',
};
const hr = { borderColor: '#D6D8D9', margin: '24px 32px' };
const paragraph = { fontFamily: 'Arial, sans-serif', fontSize: 14, lineHeight: 1.6, color: '#4C4C4B', padding: '0 32px', marginBottom: 16 };
const link = { color: '#E30613', textDecoration: 'underline', fontWeight: 600 };
const signature = { padding: '0 32px 16px' };
const signatureText = { fontFamily: 'Arial, sans-serif', fontSize: 14, lineHeight: 1.6, color: '#4C4C4B', margin: 0 };
const footer = { padding: '8px 32px 32px' };
const footerText = { fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#828485', margin: '4px 0' };
