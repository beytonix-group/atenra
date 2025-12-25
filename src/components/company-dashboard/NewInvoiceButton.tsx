'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddInvoiceDialog } from './AddInvoiceDialog';

interface NewInvoiceButtonProps {
	companyId: number;
}

export function NewInvoiceButton({ companyId }: NewInvoiceButtonProps) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)}>
				<Plus className="mr-2 h-4 w-4" />
				New Invoice
			</Button>
			<AddInvoiceDialog
				open={open}
				onOpenChange={setOpen}
				companyId={companyId}
			/>
		</>
	);
}
