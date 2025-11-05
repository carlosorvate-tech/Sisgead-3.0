import React, { useState, useCallback, useEffect } from 'react';
import { type UserPortalStep, type AuditRecord, type Answer, type Scores, type RetestReason, type ProfessionalProfile, type MethodologicalProfile, type ContextualProfile, type RoleSuggestion, type IdentityProfile, type ResilienceAndCollaborationProfile } from '../types';
import { WelcomeScreen } from './WelcomeScreen';
import { RetestValidationScreen } from './RetestValidationScreen';
import { Questionnaire } from './Questionnaire';
import { ResultsScreen } from './ResultsScreen';
import { ProfileExpansionScreen } from './ProfileExpansionScreen';
import { IdentityContextScreen } from './IdentityContextScreen';
import { ResilienceCollaborationScreen } from './ResilienceCollaborationScreen';
import { QUESTIONS, WORD_TO_PROFILE_MAP } from '../constants';
import { generateReportId } from '../utils/helpers';
import { createVerificationHash } from '../utils/crypto';
import { suggestRoles } from '../services/geminiService';
import { Modal } from './Modal';
import { USER_MANUAL_INTERVIEWEE_CONTENT } from '../documents';
import { MarkdownRenderer } from './MarkdownRenderer';

interface UserPortalProps {
    checkIfCpfExists: (cpf: string) => AuditRecord | undefined;
    onRecordSubmit: (record: AuditRecord) => Promise<void>;
}

export const UserPortal: React.FC<UserPortalProps> = ({ checkIfCpfExists, onRecordSubmit }) => {
    const [step, setStep] = useState<UserPortalStep>('welcome');
    const [name, setName] = useState('');
    const [cpf, setCpf] = useState('');
    
    const [currentRecord, setCurrentRecord] = useState<AuditRecord | null>(null);
    const [retestTarget, setRetestTarget] = useState<AuditRecord | null>(null);
    const [retestReason, setRetestReason] = useState<RetestReason | null>(null);
    const [expansionOffered, setExpansionOffered] = useState(false);
    const [identityOffered, setIdentityOffered] = useState(false);
    const [resilienceOffered, setResilienceOffered] = useState(false);
    const [showUserManual, setShowUserManual] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);


    useEffect(() => {
        document.title = "Portal do Usuário - Diagnóstico DISC";
    }, []);

    const resetUserFlow = useCallback(() => {
        setName('');
        setCpf('');
        setCurrentRecord(null);
        setRetestTarget(null);
        setRetestReason(null);
        setExpansionOffered(false);
        setIdentityOffered(false);
        setResilienceOffered(false);
        setStep('welcome');
    }, []);

    const handleStart = () => {
        const existingRecord = checkIfCpfExists(cpf);
        if (existingRecord) {
            setRetestTarget(existingRecord);
            setStep('retest_validation');
        } else {
            setStep('questionnaire');
        }
    };

    const handleRetestConfirm = (reason: RetestReason) => {
        setRetestReason(reason);
        setStep('questionnaire');
    };

    const handleQuestionnaireComplete = async (answers: Record<number, Answer>) => {
        setIsProcessing(true);
        const scores: Scores = { D: 0, I: 0, S: 0, C: 0 };
        QUESTIONS.forEach(q => {
            const answer = answers[q.id];
            if (answer?.more) scores[WORD_TO_PROFILE_MAP[answer.more]] += 2;
            if (answer?.less) scores[WORD_TO_PROFILE_MAP[answer.less]] -= 1;
        });
        Object.keys(scores).forEach(key => {
            scores[key as 'D'|'I'|'S'|'C'] = Math.max(0, scores[key as 'D'|'I'|'S'|'C']);
        });
        const sortedProfiles = (Object.keys(scores) as ('D'|'I'|'S'|'C')[]).sort((a, b) => scores[b] - scores[a]);
        const verificationHash = await createVerificationHash({ name, cpf, scores });
        const newRecord: AuditRecord = {
            id: generateReportId(), name, cpf, date: new Date().toISOString(), scores,
            primaryProfile: sortedProfiles[0],
            secondaryProfile: sortedProfiles[1] && scores[sortedProfiles[1]] > 0 ? sortedProfiles[1] : null,
            verificationHash,
            ...(retestTarget && retestReason && { previousReportId: retestTarget.id, retestReason }),
        };
        
        await onRecordSubmit(newRecord);

        setCurrentRecord(newRecord);
        setIsProcessing(false);
        setStep('results');
    };

    const handleResultsContinue = () => {
        if (!expansionOffered) {
            setExpansionOffered(true);
            setStep('expansion');
        } else if (!identityOffered) {
            setIdentityOffered(true);
            setStep('identity_context');
        } else if (!resilienceOffered) {
            setResilienceOffered(true);
            setStep('resilience_collaboration');
        }
    };

    const handleExpansionComplete = async (
        profProfile: ProfessionalProfile,
        methodProfile: MethodologicalProfile,
        ctxProfile: ContextualProfile
    ) => {
        if (!currentRecord) return;
        setIsProcessing(true);
        let updatedRecord = { ...currentRecord,
            professionalProfile: profProfile,
            methodologicalProfile: methodProfile,
            contextualProfile: ctxProfile
        };
        const roles = await suggestRoles(updatedRecord, 'gemini');
        updatedRecord = { ...updatedRecord, roleSuggestions: roles };
        setCurrentRecord(updatedRecord);
        await onRecordSubmit(updatedRecord);
        setIsProcessing(false);
        setStep('identity_context');
        setIdentityOffered(true);
    };
    
    const handleExpansionSkip = () => {
        setStep('identity_context');
        setIdentityOffered(true);
    };

    const handleIdentityComplete = async (identityProfile: IdentityProfile) => {
        if (!currentRecord) return;
        setIsProcessing(true);
        const recordWithIdentity = { ...currentRecord, identityProfile };
        const roles = await suggestRoles(recordWithIdentity, 'gemini');
        
        const updatedRecord = { ...recordWithIdentity, roleSuggestions: roles };
        
        setCurrentRecord(updatedRecord);
        await onRecordSubmit(updatedRecord);
        setIsProcessing(false);
        setStep('resilience_collaboration');
        setResilienceOffered(true);
    };

    const handleIdentitySkip = () => {
        setStep('resilience_collaboration');
        setResilienceOffered(true);
    };
    
    const handleResilienceComplete = async (resilienceProfile: ResilienceAndCollaborationProfile) => {
        if (!currentRecord) return;
        setIsProcessing(true);
        const recordWithResilience = { ...currentRecord, resilienceAndCollaborationProfile: resilienceProfile };
        
        const roles = await suggestRoles(recordWithResilience, 'gemini');
        const updatedRecord = { ...recordWithResilience, roleSuggestions: roles };

        setCurrentRecord(updatedRecord);
        await onRecordSubmit(updatedRecord);
        setIsProcessing(false);
        setStep('results');
    };

    const handleResilienceSkip = () => {
        setStep('results');
    };

    if (isProcessing) {
        return (
            <div className="flex items-center justify-center p-8 min-h-[400px]">
                <p className="text-lg text-brand-secondary animate-pulse">Processando seus dados...</p>
            </div>
        );
    }

    return (
        <>
            {showUserManual && (
                <Modal 
                    title="Guia do Usuário (Entrevistado)" 
                    onClose={() => setShowUserManual(false)} 
                    size="3xl"
                    footerContent={<button onClick={() => setShowUserManual(false)} className="px-6 py-2 bg-brand-primary text-white rounded-md">Fechar</button>}
                >
                    <MarkdownRenderer content={USER_MANUAL_INTERVIEWEE_CONTENT} />
                </Modal>
            )}
            {(() => {
                switch (step) {
                    case 'welcome':
                        return <WelcomeScreen name={name} setName={setName} cpf={cpf} setCpf={setCpf} onStart={handleStart} onShowManual={() => setShowUserManual(true)} />;
                    case 'retest_validation':
                        return retestTarget ? <RetestValidationScreen targetRecord={retestTarget} onConfirm={handleRetestConfirm} onCancel={resetUserFlow} /> : null;
                    case 'questionnaire':
                        return <Questionnaire onComplete={handleQuestionnaireComplete} onCancel={resetUserFlow} />;
                    case 'results':
                        return currentRecord ? <ResultsScreen record={currentRecord} onContinue={handleResultsContinue} onFinish={resetUserFlow} isFinal={!!currentRecord.resilienceAndCollaborationProfile || (expansionOffered && identityOffered && resilienceOffered)} /> : null;
                    case 'expansion':
                        return <ProfileExpansionScreen onComplete={handleExpansionComplete} onSkip={handleExpansionSkip} />;
                    case 'identity_context':
                        return <IdentityContextScreen onComplete={handleIdentityComplete} onSkip={handleIdentitySkip} />;
                    case 'resilience_collaboration':
                        return <ResilienceCollaborationScreen onComplete={handleResilienceComplete} onSkip={handleResilienceSkip} />;
                    default:
                        return <div>Carregando...</div>;
                }
            })()}
        </>
    );
};
// bycao (ogrorvatigão) 2025