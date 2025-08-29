import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SizeChartProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeChart: React.FC<SizeChartProps> = ({ isOpen, onClose }) => {
  const sizeData = [
    { size: 'XS', bust: '32-34', waist: '24-26', hips: '34-36' },
    { size: 'S', bust: '34-36', waist: '26-28', hips: '36-38' },
    { size: 'M', bust: '36-38', waist: '28-30', hips: '38-40' },
    { size: 'L', bust: '38-40', waist: '30-32', hips: '40-42' },
    { size: 'XL', bust: '40-42', waist: '32-34', hips: '42-44' },
    { size: 'XXL', bust: '42-44', waist: '34-36', hips: '44-46' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Size Chart</DialogTitle>
          <DialogDescription>
            Find your perfect fit with our detailed size guide. All measurements are in inches.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Size</TableHead>
                <TableHead>Bust</TableHead>
                <TableHead>Waist</TableHead>
                <TableHead>Hips</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sizeData.map((row) => (
                <TableRow key={row.size}>
                  <TableCell className="font-medium">{row.size}</TableCell>
                  <TableCell>{row.bust}"</TableCell>
                  <TableCell>{row.waist}"</TableCell>
                  <TableCell>{row.hips}"</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">How to Measure</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li><strong>Bust:</strong> Measure around the fullest part of your bust</li>
              <li><strong>Waist:</strong> Measure around your natural waistline</li>
              <li><strong>Hips:</strong> Measure around the fullest part of your hips</li>
            </ul>
          </div>
          
          <div className="bg-accent p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Fit Tips</h4>
            <ul className="text-sm space-y-1">
              <li>• For a relaxed fit, choose one size up</li>
              <li>• For fitted styles, choose your exact measurements</li>
              <li>• When between sizes, size up for comfort</li>
              <li>• Check product descriptions for specific fit information</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};