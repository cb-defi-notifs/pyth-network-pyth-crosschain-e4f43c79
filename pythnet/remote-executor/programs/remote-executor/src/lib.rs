#![deny(warnings)]
#![allow(clippy::result_large_err)]

use anchor_lang::{
    prelude::*,
    solana_program::borsh::get_packed_len,
    system_program,
};
use error::ExecutorError;
use state::{
    claim_record::ClaimRecord,
    posted_vaa::AnchorVaa,
};
use wormhole::Chain::{
    self,
    Solana,
};

mod error;
mod state;

#[cfg(test)]
mod tests;

//Anchor requires the program to declare its own id
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod remote_executor {
    use anchor_lang::solana_program::{
        instruction::Instruction,
        program::invoke_signed,
    };

    use crate::state::governance_payload::ExecutorPayload;

    use super::*;

    pub fn execute_posted_vaa(ctx: Context<ExecutePostedVaa>) -> Result<()> {
        let posted_vaa = &ctx.accounts.posted_vaa;
        let claim_record = &mut ctx.accounts.claim_record;
        claim_record.sequence = posted_vaa.sequence;

        let payload = ExecutorPayload::try_from_slice(&posted_vaa.payload)?;
        payload.check_header()?;

        let (_, bump) = Pubkey::find_program_address(
            &[EXECUTOR_KEY_SEED.as_bytes(), &posted_vaa.emitter_address],
            &id(),
        );

        for instruction in payload.instructions.iter().map(Instruction::from) {
            // TO DO: We currently pass `remaining_accounts` down to the CPIs, is there a more efficient way to do it?
            invoke_signed(
                &instruction,
                ctx.remaining_accounts,
                &[&[
                    EXECUTOR_KEY_SEED.as_bytes(),
                    &posted_vaa.emitter_address,
                    &[bump],
                ]],
            )?;
        }
        Ok(())
    }
}

const EXECUTOR_KEY_SEED: &str = "EXECUTOR_KEY";
const CLAIM_RECORD_SEED: &str = "CLAIM_RECORD";

#[derive(Accounts)]
pub struct ExecutePostedVaa<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(constraint = Chain::from(posted_vaa.emitter_chain) == Solana @ ExecutorError::EmitterChainNotSolana, constraint = posted_vaa.sequence > claim_record.sequence @ExecutorError::NonIncreasingSequence )]
    pub posted_vaa: Account<'info, AnchorVaa>,
    /// The reason claim_record has different seeds than executor_key is that executor key might need to pay in the CPI, so we want it to be a wallet
    #[account(init_if_needed, space = 8 + get_packed_len::<ClaimRecord>(), payer=payer, seeds = [CLAIM_RECORD_SEED.as_bytes(), &posted_vaa.emitter_address], bump)]
    pub claim_record: Account<'info, ClaimRecord>,
    pub system_program: Program<'info, System>,
    // Additional accounts will be passed down to the CPIs, very importantly, executor_key needs to be passed as it will be the signer of the CPIs
    // This is the "anchor specification" of that account
    // #[account(seeds = [EXECUTOR_KEY_SEED.as_bytes(), &posted_vaa.emitter_address], bump)]
    // pub executor_key: UncheckedAccount<'info>,
}

impl crate::accounts::ExecutePostedVaa {
    pub fn populate(
        program_id: &Pubkey,
        payer: &Pubkey,
        emitter: &Pubkey,
        posted_vaa: &Pubkey,
    ) -> Self {
        let claim_record = Pubkey::find_program_address(
            &[CLAIM_RECORD_SEED.as_bytes(), &emitter.to_bytes()],
            program_id,
        )
        .0;
        crate::accounts::ExecutePostedVaa {
            payer: *payer,
            claim_record,
            posted_vaa: *posted_vaa,
            system_program: system_program::ID,
        }
    }
}
