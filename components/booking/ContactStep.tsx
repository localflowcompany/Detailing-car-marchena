export type ContactData = {
  name: string;
  phone: string;
  carModel: string;
};

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-label-tech text-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="border-b bg-[#161616] px-4 py-3 text-body-md text-white outline-none transition-colors placeholder:text-[#666666]"
        style={{ borderColor: "#333333" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-gold)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#333333")}
      />
    </label>
  );
}

export function ContactStep({
  data,
  onChange,
}: {
  data: ContactData;
  onChange: (data: ContactData) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-headline-sm">Tus datos</h2>
      <Field
        label="Nombre"
        value={data.name}
        onChange={(v) => onChange({ ...data, name: v })}
        placeholder="Tu nombre"
      />
      <Field
        label="Teléfono"
        type="tel"
        value={data.phone}
        onChange={(v) => onChange({ ...data, phone: v })}
        placeholder="600 000 000"
      />
      <Field
        label="Marca y modelo del coche"
        value={data.carModel}
        onChange={(v) => onChange({ ...data, carModel: v })}
        placeholder="Ej. Volkswagen Golf"
      />
    </div>
  );
}
