import { Construction } from 'lucide-react';

export function AdminTransactions() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="bg-accent/10 p-6 rounded-full mb-6">
        <Construction className="h-16 w-16 text-accent" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Tính năng đang được phát triển</h2>
      <p className="text-muted-foreground max-w-md">
        Chức năng quản lý giao dịch hiện đang được phát triển và sẽ sớm được ra mắt.
      </p>
    </div>
  );
}
