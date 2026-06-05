export function calculateInstallment(
  vehiclePrice: number,
  downPayment: number,
  tenor: number,
): number {
  const loanAmount = vehiclePrice - downPayment;
  const interestRate = 0.08; // 8% annual interest rate
  const monthlyRate = interestRate / 12;

  if (loanAmount <= 0 || tenor <= 0) return 0;

  const installment =
    (loanAmount * monthlyRate * (1 + monthlyRate) ** tenor) /
    ((1 + monthlyRate) ** tenor - 1);

  return Math.round(installment);
}
