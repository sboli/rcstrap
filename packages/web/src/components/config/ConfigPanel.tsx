import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchConfig, setConfigValue, resetConfigValue } from '../../lib/api';
import { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

export default function ConfigPanel() {
  const queryClient = useQueryClient();
  const { data: config } = useQuery({ queryKey: ['config'], queryFn: fetchConfig });

  const mutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      setConfigValue(key, value),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['config'] }),
  });

  const resetMutation = useMutation({
    mutationFn: (key: string) => resetConfigValue(key),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['config'] }),
  });

  if (!config) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-xl font-bold">Settings</h1>

      <Section title="Webhook">
        <TextInput
          label="Webhook URL"
          configKey="webhookUrl"
          value={config.webhookUrl}
          onSave={(v) => mutation.mutate({ key: 'webhookUrl', value: v })}
          onReset={() => resetMutation.mutate('webhookUrl')}
        />
        <NumberInput
          label="Timeout (ms)"
          configKey="webhookTimeoutMs"
          value={config.webhookTimeoutMs}
          onSave={(v) => mutation.mutate({ key: 'webhookTimeoutMs', value: String(v) })}
          onReset={() => resetMutation.mutate('webhookTimeoutMs')}
        />
      </Section>

      <Section title="Delivery Reports">
        <RangeInput
          label="Delivered %"
          value={config.deliveryReportDeliveredPct}
          onSave={(v) => mutation.mutate({ key: 'deliveryReportDeliveredPct', value: String(v) })}
          onReset={() => resetMutation.mutate('deliveryReportDeliveredPct')}
        />
        <RangeInput
          label="Read %"
          value={config.deliveryReportReadPct}
          onSave={(v) => mutation.mutate({ key: 'deliveryReportReadPct', value: String(v) })}
          onReset={() => resetMutation.mutate('deliveryReportReadPct')}
        />
        <ToggleInput
          label="IS_TYPING enabled"
          value={config.deliveryReportIsTypingEnabled}
          onSave={(v) => mutation.mutate({ key: 'deliveryReportIsTypingEnabled', value: String(v) })}
          onReset={() => resetMutation.mutate('deliveryReportIsTypingEnabled')}
        />
        <NumberInput
          label="Report delay (ms)"
          configKey="deliveryReportDelayMs"
          value={config.deliveryReportDelayMs}
          onSave={(v) => mutation.mutate({ key: 'deliveryReportDelayMs', value: String(v) })}
          onReset={() => resetMutation.mutate('deliveryReportDelayMs')}
        />
      </Section>

      <Section title="Agent">
        <TextInput
          label="Agent ID"
          configKey="agentId"
          value={config.agentId}
          onSave={(v) => mutation.mutate({ key: 'agentId', value: v })}
          onReset={() => resetMutation.mutate('agentId')}
        />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ResetButton({ onReset }: { onReset: () => void }) {
  return (
    <button
      onClick={onReset}
      className="text-gray-400 hover:text-gray-600 p-1"
      title="Reset to default"
    >
      <RotateCcw size={14} />
    </button>
  );
}

function TextInput({
  label,
  configKey,
  value,
  onSave,
  onReset,
}: {
  label: string;
  configKey: string;
  value: string;
  onSave: (v: string) => void;
  onReset: () => void;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-700 w-36 shrink-0">{label}</label>
      <input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => local !== value && onSave(local)}
        className="flex-1 border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <ResetButton onReset={onReset} />
    </div>
  );
}

function NumberInput({
  label,
  configKey,
  value,
  onSave,
  onReset,
}: {
  label: string;
  configKey: string;
  value: number;
  onSave: (v: number) => void;
  onReset: () => void;
}) {
  const [local, setLocal] = useState(String(value));
  useEffect(() => setLocal(String(value)), [value]);

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-700 w-36 shrink-0">{label}</label>
      <input
        type="number"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => String(value) !== local && onSave(Number(local))}
        className="flex-1 border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <ResetButton onReset={onReset} />
    </div>
  );
}

function RangeInput({
  label,
  value,
  onSave,
  onReset,
}: {
  label: string;
  value: number;
  onSave: (v: number) => void;
  onReset: () => void;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-700 w-36 shrink-0">{label}</label>
      <input
        type="range"
        min={0}
        max={100}
        value={local}
        onChange={(e) => setLocal(Number(e.target.value))}
        onMouseUp={() => local !== value && onSave(local)}
        className="flex-1"
      />
      <span className="text-sm text-gray-600 w-10 text-right">{local}%</span>
      <ResetButton onReset={onReset} />
    </div>
  );
}

function ToggleInput({
  label,
  value,
  onSave,
  onReset,
}: {
  label: string;
  value: boolean;
  onSave: (v: boolean) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-700 w-36 shrink-0">{label}</label>
      <button
        onClick={() => onSave(!value)}
        className={`w-10 h-5 rounded-full transition-colors relative ${
          value ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
            value ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
      <ResetButton onReset={onReset} />
    </div>
  );
}
