'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddJobDialog } from './AddJobDialog';

interface NewJobButtonProps {
	companyId: number;
}

export function NewJobButton({ companyId }: NewJobButtonProps) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)}>
				<Plus className="mr-2 h-4 w-4" />
				New Job
			</Button>
			<AddJobDialog
				open={open}
				onOpenChange={setOpen}
				companyId={companyId}
			/>
		</>
	);
}
