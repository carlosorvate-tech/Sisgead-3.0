export const generateReportId = (): string => `DISC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
export const generateProposalId = (): string => `PROP-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
export const generateTeamId = (): string => `TEAM-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export const maskCPF = (raw: string): string => {
  return raw
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const validateCPF = (cpf: string): boolean => {
    const cpfClean = cpf.replace(/[^\d]/g, '');

    if (cpfClean.length !== 11 || /^(\d)\1+$/.test(cpfClean)) {
        return false;
    }

    let sum = 0;
    let remainder: number;

    for (let i = 1; i <= 9; i++) {
        sum += parseInt(cpfClean.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) {
        remainder = 0;
    }
    if (remainder !== parseInt(cpfClean.substring(9, 10))) {
        return false;
    }

    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(cpfClean.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) {
        remainder = 0;
    }
    if (remainder !== parseInt(cpfClean.substring(10, 11))) {
        return false;
    }

    return true;
};
// bycao (ogrorvatigão) 2025