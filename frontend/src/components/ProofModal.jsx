import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ShieldCheck, 
  Copy, 
  Check, 
  Calendar, 
  UserCheck, 
  Award, 
  FileText, 
  Cpu 
} from 'lucide-react';

export const ProofModal = ({ item, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !item) return null;

  const handleCopyHash = () => {
    if (item.blockchainHash) {
      navigator.clipboard.writeText(item.blockchainHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0d1413]/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl rounded-[28px] bg-[#1E2B2A] border border-white/[0.12] p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-5 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#B7F34A]/10 border border-[#B7F34A]/30 flex items-center justify-center text-[#B7F34A]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#B7F34A] bg-[#B7F34A]/10 px-2 py-0.5 rounded-full border border-[#B7F34A]/20">
                    On-Chain Verified Record
                  </span>
                  <span className="text-[11px] font-mono text-[#9FB0AD]">
                    {item.blockNumber || 'Block #1,849,204'}
                  </span>
                  <span className="text-[10px] text-[#9FB0AD]/60 font-mono italic">
                    (Demo data: not a live blockchain record)
                  </span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#F3F1EA] mt-1">
                  Credential <span className="italic text-[#B7F34A]">Audit Proof</span>
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close proof modal"
              className="p-2 rounded-full text-[#9FB0AD] hover:text-[#F3F1EA] hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Modal Content */}
          <div className="overflow-y-auto py-5 space-y-6 pr-1 custom-scroll">
            {/* Title & Metadata */}
            <div className="bg-[#172120] rounded-2xl p-5 border border-white/[0.06]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-[#B7F34A] border border-[#B7F34A]/20">
                  {item.category}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-[#9FB0AD]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{item.formattedDate || item.date}</span>
                </div>
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-[#F3F1EA]">
                {item.title}
              </h4>
              <p className="text-xs text-[#9FB0AD] mt-2 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Certificate Preview Card */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#9FB0AD] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#B7F34A]" /> Certificate Document Preview
                </span>
                <span className="text-[11px] text-[#9FB0AD] font-mono">
                  {item.fileName || 'certificate_proof.pdf'}
                </span>
              </div>
              
              {item.fileUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#141D1C] group">
                  <img
                    src={item.fileUrl}
                    alt="Certificate Preview"
                    className="w-full h-48 sm:h-56 object-cover object-center opacity-85 group-hover:opacity-95 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141D1C] via-[#141D1C]/40 to-transparent flex flex-col justify-end p-5">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs font-semibold text-[#F3F1EA]">
                          {item.proofType || 'Official Institutional Credential'}
                        </p>
                        <p className="text-[11px] text-[#B7F34A]">
                          Issued by: {item.issuer || 'Academic Verification Cell'}
                        </p>
                      </div>
                      <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#172120]/90 text-[#F3F1EA] border border-white/15 backdrop-blur-md">
                        Digital Watermark Valid
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-[#141D1C] p-6 sm:p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#1E2B2A] border border-white/10 flex items-center justify-center text-[#B7F34A] mb-3 shadow-inner">
                    <FileText className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-semibold text-[#F3F1EA]">
                    {item.fileName || 'certificate_proof.pdf'}
                  </p>
                  <p className="text-xs text-[#9FB0AD] mt-1">
                    PDF document · preview unavailable in demo
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#1E2B2A] text-[#9FB0AD] border border-white/[0.08]">
                      {item.proofType || 'Accredited Institutional Document'}
                    </span>
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-[#B7F34A] border border-[#B7F34A]/20">
                      SHA-256 Checksum Verified
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Approval Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#172120] rounded-2xl p-4 border border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs text-[#9FB0AD] mb-1">
                  <UserCheck className="w-4 h-4 text-[#B7F34A]" />
                  <span>Approved By Faculty</span>
                </div>
                <p className="text-sm font-semibold text-[#F3F1EA] mt-1">
                  {item.approver}
                </p>
                <p className="text-[11px] text-[#9FB0AD]">
                  {item.approverRole || 'Verified Departmental Signatory'}
                </p>
              </div>

              <div className="bg-[#172120] rounded-2xl p-4 border border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs text-[#9FB0AD] mb-1">
                  <Award className="w-4 h-4 text-[#B7F34A]" />
                  <span>Accreditation Eligibility</span>
                </div>
                <p className="text-sm font-semibold text-[#B7F34A] mt-1">
                  NAAC Criterion 5.3 & NIRF
                </p>
                <p className="text-[11px] text-[#9FB0AD]">
                  Eligible for institutional credit weightage
                </p>
              </div>
            </div>

            {/* Cryptographic Ledger Details */}
            <div className="bg-[#15201F] rounded-2xl p-5 border border-[#B7F34A]/20 shadow-[0_0_20px_rgba(183,243,74,0.05)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#B7F34A] flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" /> SHA-256 Ledger Provenance
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#B7F34A]">
                  Consensus Confirmed
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {/* Hash */}
                <div>
                  <div className="text-[10px] text-[#9FB0AD] uppercase mb-1 flex items-center justify-between">
                    <span>Cryptographic Digest (SHA-256)</span>
                    <button
                      onClick={handleCopyHash}
                      className="inline-flex items-center gap-1 text-[#B7F34A] hover:underline cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy Hash'}</span>
                    </button>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#101716] border border-white/[0.08] text-[#F3F1EA] text-[11px] break-all select-all">
                    {item.blockchainHash || '0x7f4c9b21a8d3e9104fa2e17c09d57a22bc194de8f32194a0b5c1928374a5e6d1'}
                  </div>
                  <div className="text-[10px] text-[#9FB0AD]/60 font-mono italic mt-1">
                    Demo data: not a live blockchain record
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] pt-1">
                  <div>
                    <span className="text-[#9FB0AD] block">Network Node:</span>
                    <span className="text-[#F3F1EA]">{item.network || 'Govt. J&K EduLedger (Proof-of-Authority)'}</span>
                  </div>
                  <div>
                    <span className="text-[#9FB0AD] block">Block Timestamp:</span>
                    <span className="text-[#F3F1EA]">{item.timestamp || '2024-12-19 · 14:32:10 UTC'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Awarded */}
            {item.skillsAwarded && item.skillsAwarded.length > 0 && (
              <div>
                <span className="text-xs text-[#9FB0AD] font-medium block mb-2">
                  Skills Credited into Student Competency Graph:
                </span>
                <div className="flex flex-wrap gap-2">
                  {item.skillsAwarded.map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1 rounded-full bg-[#1E2B2A] border border-white/10 text-[#F3F1EA]"
                    >
                      +{skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
            <button
              onClick={handleCopyHash}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-[#F3F1EA] transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-[#B7F34A]" />
              {copied ? 'Hash Copied!' : 'Copy Verification Hash'}
            </button>

            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#B7F34A] hover:bg-[#C9FA62] text-xs font-semibold text-[#172120] transition-colors shadow-[0_0_20px_rgba(183,243,74,0.25)] cursor-pointer"
            >
              Done →
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
