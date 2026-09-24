"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SERVICES, type ServiceId } from "@/config/availability";
import { buildBookingWhatsAppLink } from "@/lib/whatsapp";
import { Button } from "@/components/shared/Button";
import { StepIndicator } from "./StepIndicator";
import { ServiceStep } from "./ServiceStep";
import { CalendarStep } from "./CalendarStep";
import { TimeSlotStep } from "./TimeSlotStep";
import { ContactStep, type ContactData } from "./ContactStep";

function isKnownService(value: string | null): value is ServiceId {
  return !!value && SERVICES.some((s) => s.id === value);
}

export function BookingFlow({ initialService }: { initialService: string | null }) {
  const preselected = isKnownService(initialService) ? initialService : null;

  const [step, setStep] = useState(1);
  const [service, setService] = useState<ServiceId | null>(preselected);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [contact, setContact] = useState<ContactData>({
    name: "",
    phone: "",
    carModel: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const serviceLabel = useMemo(
    () => SERVICES.find((s) => s.id === service)?.label ?? "",
    [service]
  );

  const canContinue =
    (step === 1 && service !== null) ||
    (step === 2 && date !== null) ||
    (step === 3 && time !== null) ||
    (step === 4 &&
      contact.name.trim() !== "" &&
      contact.phone.trim() !== "" &&
      contact.carModel.trim() !== "");

  function handleConfirm() {
    if (!service || !date || !time) return;
    const link = buildBookingWhatsAppLink({
      serviceLabel,
      date,
      time,
      carModel: contact.carModel,
      name: contact.name,
    });
    window.open(link, "_blank", "noopener,noreferrer");
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-6 py-20 text-center">
        <span className="text-eyebrow text-gold">CITA SOLICITADA</span>
        <h1 className="text-headline-lg max-w-md">
          Te confirmamos en unos minutos por WhatsApp.
        </h1>
        <p className="text-body-md max-w-sm text-muted">
          Si no se ha abierto WhatsApp automáticamente, revisa que tu
          navegador permita ventanas emergentes y vuelve a intentarlo.
        </p>
        <Link href="/" className="text-eyebrow text-gold underline underline-offset-4">
          Volver a inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <StepIndicator current={step} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {step === 1 && (
            <ServiceStep
              selected={service}
              onSelect={(id) => {
                setService(id);
                setStep(2);
              }}
            />
          )}
          {step === 2 && (
            <CalendarStep
              selected={date}
              onSelect={(d) => {
                setDate(d);
                setTime(null);
                setStep(3);
              }}
            />
          )}
          {step === 3 && date && (
            <TimeSlotStep
              date={date}
              selected={time}
              onSelect={(t) => {
                setTime(t);
                setStep(4);
              }}
            />
          )}
          {step === 4 && <ContactStep data={contact} onChange={setContact} />}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
        >
          Atrás
        </Button>

        {step < 4 ? (
          <Button
            type="button"
            variant="primary"
            disabled={!canContinue}
            onClick={() => setStep((s) => Math.min(4, s + 1))}
          >
            Continuar
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            disabled={!canContinue}
            onClick={handleConfirm}
          >
            Confirmar cita
          </Button>
        )}
      </div>
    </div>
  );
}
