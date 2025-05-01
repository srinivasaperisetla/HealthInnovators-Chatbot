'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function HumanMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="flex gap-3 items-start max-w-sm">
        <div className="flex flex-col items-end space-y-1">
          <div className="text-sm font-medium text-right text-zinc-100">You</div>
          <div className="rounded-lg bg-[#2b2b2b] px-3 py-2 text-sm text-white">
            {text}
          </div>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarImage src="/avatars/human.png" alt="Human" />
          <AvatarFallback>H</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}

export function AIMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-start">
      <div className="flex gap-3 items-start max-w-sm">
        <Avatar className="h-8 w-8 bg-blue-600">
          <AvatarImage src="/avatars/gemini.jpg" alt="Gemini" />
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
        <div className="flex flex-col space-y-1">
          <div className="text-sm font-medium text-white">Gemini</div>
          <div className="rounded-lg px-3 py-2 text-sm text-white">
            {text}
          </div>
        </div>
      </div>
    </div>
  );
}

type Provider = {
  number: string;
  basic: { first_name: string; last_name: string };
  addresses?: Array<{
    address_purpose: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    telephone_number?: string;
  }>;
  taxonomies?: Array<{ code?: string; desc?: string; primary?: boolean | 'Y' | 'N' }>;
};

interface getDoctorsProps {
  providers: Provider[];
}

export function FunctionMessage({ providers }: getDoctorsProps) {
  return (
    <div className="flex justify-start">
      <div className="flex gap-3 items-start max-w-full">
        <Avatar className="h-8 w-8 bg-blue-600">
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
        <div className="flex flex-col space-y-1">
          <div className="text-sm font-medium text-white">Gemini</div>
          <div className="rounded-lg bg-[#2b2b2b] p-4 text-white overflow-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="px-2 py-1">Name</th>
                  <th className="px-2 py-1">Phone</th>
                  <th className="px-2 py-1">Address</th>
                  <th className="px-2 py-1">Primary Taxonomy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {providers.map((p, i) => {
                  const name = `${p.basic.first_name} ${p.basic.last_name}`;
                  const practice = p.addresses?.find(a => a.address_purpose === 'LOCATION');
                  const phone = practice?.telephone_number ?? '—';
                  const address = practice
                    ? [
                        practice.address_1,
                        practice.address_2
                      ]
                        .filter(Boolean)
                        .join(' ') +
                      `, ${practice.city}, ${practice.state} ${practice.postal_code}`
                    : '—';
                  const primary = p.taxonomies?.find(t => t.primary === true || t.primary === 'Y');
                  const taxonomy = primary ? `${primary.desc} (${primary.code})` : '—';
                  return (
                    <tr key={p.number || i}>
                      <td className="px-2 py-1 align-top">{name}</td>
                      <td className="px-2 py-1 align-top">{phone}</td>
                      <td className="px-2 py-1 align-top">{address}</td>
                      <td className="px-2 py-1 align-top">{taxonomy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

