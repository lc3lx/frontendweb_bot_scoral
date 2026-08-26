import { Badge } from '@landing/components/atoms/Badge';
import { Button } from '@landing/components/atoms/Button';
import { Text } from '@landing/components/atoms/Text';
import { Card } from '@landing/components/molecules/Card';
import { SectionTitle } from '@landing/components/molecules/SectionTitle';
import { SectionContainer } from '@landing/components/organisms/SectionContainer';
import styles from './ComponentLab.module.css';

/**
 * Internal shared-component lab for responsive QA.
 * Not part of the public Landing experience.
 */
export function ComponentLabPage() {
  return (
    <div className={styles.lab}>
      <SectionContainer id="lab-intro" spacing="md" background="default">
        <SectionTitle
          eyebrow="Component lab"
          title="Shared component library"
          description="Generic atoms and molecules — responsive from 320px to 1440px+."
        />
      </SectionContainer>

      <SectionContainer id="lab-buttons" spacing="md" background="surface">
        <Text as="h3" variant="title" tone="heading" className={styles.blockTitle}>
          Buttons
        </Text>
        <div className={styles.row}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </SectionContainer>

      <SectionContainer id="lab-badges" spacing="md">
        <Text as="h3" variant="title" tone="heading" className={styles.blockTitle}>
          Badges
        </Text>
        <div className={styles.row}>
          <Badge variant="soft">Soft badge</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="eyebrow">Eyebrow</Badge>
        </div>
      </SectionContainer>

      <SectionContainer id="lab-cards" spacing="md" background="glow">
        <Text as="h3" variant="title" tone="heading" className={styles.blockTitle}>
          Cards
        </Text>
        <div className={styles.grid}>
          <Card>
            <Text as="h4" variant="title" tone="heading">
              Card title
            </Text>
            <Text variant="body" tone="body" className={styles.cardBody}>
              Generic card surface with glow border. Content is composed by callers.
            </Text>
          </Card>
          <Card variant="default">
            <Text as="h4" variant="title" tone="heading">
              Default card
            </Text>
            <Text variant="body" tone="body" className={styles.cardBody}>
              Flat elevated surface without gradient glow.
            </Text>
          </Card>
        </div>
      </SectionContainer>
    </div>
  );
}
