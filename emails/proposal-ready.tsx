import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

export type ProposalReadyEmailProps = {
  agencyName: string;
  clientName: string;
  proposalTitle: string;
  totalAmount: string;
  reviewUrl: string;
};

export function ProposalReadyEmail({
  agencyName,
  clientName,
  proposalTitle,
  totalAmount,
  reviewUrl,
}: ProposalReadyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {agencyName} sent you a proposal: {proposalTitle}
      </Preview>
      <Tailwind>
        <Body className="bg-neutral-50 font-sans">
          <Container className="mx-auto my-10 max-w-[560px] rounded-lg border border-solid border-neutral-200 bg-white px-8 py-10">
            <Heading className="m-0 text-xl font-semibold tracking-tight text-neutral-900">
              Velo
            </Heading>

            <Section className="mt-8">
              <Text className="m-0 text-base text-neutral-900">
                Hi {clientName},
              </Text>
              <Text className="mt-4 text-base leading-relaxed text-neutral-700">
                {agencyName} has prepared a proposal for you to review:{" "}
                <strong>{proposalTitle}</strong>.
              </Text>
            </Section>

            <Section className="mt-6 rounded-md bg-neutral-50 px-5 py-4">
              <Text className="m-0 text-xs uppercase tracking-wider text-neutral-500">
                Proposal total
              </Text>
              <Text className="mt-1 text-2xl font-semibold text-neutral-900">
                {totalAmount}
              </Text>
            </Section>

            <Section className="mt-8 text-center">
              <Button
                href={reviewUrl}
                className="rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white no-underline"
              >
                Review Proposal
              </Button>
            </Section>

            <Text className="mt-6 text-sm text-neutral-500">
              Or open this link in your browser:
              <br />
              <span className="break-all text-neutral-700">{reviewUrl}</span>
            </Text>

            <Hr className="my-8 border-neutral-200" />

            <Text className="m-0 text-xs text-neutral-400">
              You received this email because {agencyName} sent you a proposal
              through Velo.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default ProposalReadyEmail;
