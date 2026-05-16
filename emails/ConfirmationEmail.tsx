import {
  Body,
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
              Votre inscription à <strong>{eventTitle}</strong> est bien enregistrée. Vous recevrez
              le programme détaillé et les informations pratiques début septembre.
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

          <Hr style={hr} />

          <Section>
            <Text style={paragraph}>
              <strong>Besoin de modifier votre inscription ?</strong>
              <br />
              Écrivez-nous à <Link href={`mailto:${contactEmail}`} style={link}>{contactEmail}</Link> en
              précisant votre référence d'inscription.
            </Text>
            <Text style={paragraph}>
              <strong>Plus d'informations sur l'événement :</strong>
              <br />
              <Link href={appUrl} style={link}>{appUrl}</Link>
            </Text>
          </Section>

          <Hr style={hr} />

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
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        borderBottom: '1px solid #D6D8D9',
        tableLayout: 'fixed',
      }}
    >
      <tbody>
        <tr>
          <td
            style={{
              padding: '12px 8px 12px 0',
              fontFamily: 'Arial, sans-serif',
              fontSize: 11,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: '#828485',
              fontWeight: 600,
              width: 90,
              verticalAlign: 'top',
            }}
          >
            {label}
          </td>
          <td
            style={{
              padding: '12px 0',
              fontFamily: 'Arial, sans-serif',
              fontSize: 15,
              fontWeight: 600,
              color: accent ? '#E30613' : '#1d1d1b',
              textAlign: 'right',
              wordBreak: 'break-word',
              verticalAlign: 'top',
            }}
          >
            {value}
          </td>
        </tr>
      </tbody>
    </table>
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
const recap = { backgroundColor: '#ECECEC', padding: 24, margin: '24px 32px', borderRadius: 4, borderLeft: '3px solid #E30613' };
const recapTitle = { fontFamily: 'Arial, sans-serif', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' as const, color: '#828485', fontWeight: 700, margin: '0 0 12px 0' };
const hr = { borderColor: '#D6D8D9', margin: '24px 32px' };
const paragraph = { fontFamily: 'Arial, sans-serif', fontSize: 14, lineHeight: 1.6, color: '#4C4C4B', padding: '0 32px', marginBottom: 16 };
const link = { color: '#E30613', textDecoration: 'underline', fontWeight: 600 };
const footer = { padding: '8px 32px 32px' };
const footerText = { fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#828485', margin: '4px 0' };
