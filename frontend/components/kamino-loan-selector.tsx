/**
 * Kamino Loan Selector Component
 * 
 * Allows users to choose between direct payment or Kamino loan
 */

"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  calculateCollateral, 
  formatSol, 
  getLoanOptions,
  calculateLoanInterest,
  calculateRepaymentAmount,
  type KaminoLoanOption 
} from '@/lib/kamino-integration';
import { Info, TrendingUp, Shield, Zap } from 'lucide-react';

interface KaminoLoanSelectorProps {
  onSelect: (option: 'direct' | 'loan', entryFee: number, collateral?: number) => void;
  disabled?: boolean;
}

export function KaminoLoanSelector({ onSelect, disabled = false }: KaminoLoanSelectorProps) {
  const [selectedOption, setSelectedOption] = useState<'direct' | 'loan'>('direct');
  const [selectedLoan, setSelectedLoan] = useState<KaminoLoanOption | null>(null);
  const loanOptions = getLoanOptions();

  const handleSelect = () => {
    if (selectedOption === 'direct' && selectedLoan) {
      onSelect('direct', selectedLoan.entryFee);
    } else if (selectedOption === 'loan' && selectedLoan) {
      onSelect('loan', selectedLoan.entryFee, selectedLoan.collateralRequired);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Choose Payment Method</CardTitle>
          <CardDescription>
            Pay directly or use Kamino Finance to borrow with collateral
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedOption} onValueChange={(v) => setSelectedOption(v as 'direct' | 'loan')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="direct">
                <Zap className="w-4 h-4 mr-2" />
                Direct Payment
              </TabsTrigger>
              <TabsTrigger value="loan">
                <TrendingUp className="w-4 h-4 mr-2" />
                Kamino Loan
              </TabsTrigger>
            </TabsList>

            <TabsContent value="direct" className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">Direct Payment</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Pay the full entry fee upfront. Simple and straightforward.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loanOptions.map((option) => (
                  <Card
                    key={option.entryFee}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedLoan?.entryFee === option.entryFee && selectedOption === 'direct'
                        ? 'ring-2 ring-primary'
                        : ''
                    }`}
                    onClick={() => setSelectedLoan(option)}
                  >
                    <CardHeader>
                      <CardTitle className="text-2xl">{formatSol(option.entryFee)} SOL</CardTitle>
                      <CardDescription>Entry Fee</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">You pay:</span>
                          <span className="font-semibold">{formatSol(option.entryFee)} SOL</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Potential win:</span>
                          <span className="font-semibold text-green-600">
                            {formatSol(option.entryFee * 2)} SOL
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="loan" className="space-y-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                      Kamino Loan (110% Collateral)
                    </h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Deposit 110% collateral, borrow entry fee. If you win, loan is auto-repaid and collateral returned.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loanOptions.map((option) => {
                  const interest = calculateLoanInterest(option.entryFee, 5);
                  const repayment = calculateRepaymentAmount(option.entryFee, 5);
                  const netWinnings = (option.entryFee * 2) - repayment;

                  return (
                    <Card
                      key={option.entryFee}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedLoan?.entryFee === option.entryFee && selectedOption === 'loan'
                          ? 'ring-2 ring-primary'
                          : ''
                      }`}
                      onClick={() => setSelectedLoan(option)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-2xl">{formatSol(option.entryFee)} SOL</CardTitle>
                          <Badge variant="secondary">{option.estimatedAPY}% APY</Badge>
                        </div>
                        <CardDescription>Borrow Amount</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Collateral:</span>
                            <span className="font-semibold">{formatSol(option.collateralRequired)} SOL</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Interest (~5min):</span>
                            <span className="font-semibold">{formatSol(interest)} SOL</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total repayment:</span>
                            <span className="font-semibold">{formatSol(repayment)} SOL</span>
                          </div>
                          <div className="pt-2 border-t">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Net if you win:</span>
                              <span className="font-semibold text-green-600">
                                +{formatSol(netWinnings)} SOL
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">If you lose:</span>
                            <span className="text-red-600">Collateral liquidated</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div className="text-sm">
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                      How Kamino Loans Work
                    </h4>
                    <ul className="space-y-1 text-yellow-700 dark:text-yellow-300">
                      <li>• Deposit 110% of entry fee as collateral</li>
                      <li>• Borrow entry fee from Kamino Finance</li>
                      <li>• Play the game with borrowed funds</li>
                      <li>• If you win: Loan auto-repaid, collateral returned, keep winnings</li>
                      <li>• If you lose: Collateral used to repay loan</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button
              size="lg"
              onClick={handleSelect}
              disabled={disabled || !selectedLoan}
            >
              {selectedOption === 'direct' ? 'Pay Directly' : 'Borrow with Kamino'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
