import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

export default function ResetPasswordEmail({ resetUrl }: { resetUrl: string }) {
  return (
    <Html>
      <Head />
      <Preview>Restablecé tu contraseña de Curatta</Preview>
      <Body style={{ backgroundColor: "#f2e9da", fontFamily: "Georgia, serif" }}>
        <Container
          style={{
            backgroundColor: "#fbf8f3",
            margin: "40px auto",
            padding: "40px",
            maxWidth: "480px",
            borderRadius: "2px",
          }}
        >
          <Text
            style={{
              fontSize: "12px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "#8a5a3b",
              margin: "0 0 24px",
            }}
          >
            Curatta
          </Text>
          <Heading style={{ fontSize: "22px", color: "#17130f", margin: "0 0 16px" }}>
            Restablecé tu contraseña
          </Heading>
          <Text style={{ fontSize: "15px", lineHeight: "1.6", color: "#17130f" }}>
            Pediste restablecer tu contraseña en Curatta. Tocá el botón de
            abajo para elegir una nueva — este link vence en 1 hora.
          </Text>
          <Button
            href={resetUrl}
            style={{
              backgroundColor: "#17130f",
              color: "#f2e9da",
              padding: "14px 28px",
              fontSize: "13px",
              letterSpacing: "0.5px",
              borderRadius: "2px",
              margin: "24px 0",
              display: "inline-block",
            }}
          >
            Elegir nueva contraseña
          </Button>
          <Text style={{ fontSize: "13px", color: "#3b2b21", opacity: 0.7 }}>
            Si no pediste este cambio, podés ignorar este mail — tu
            contraseña actual sigue siendo válida.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
