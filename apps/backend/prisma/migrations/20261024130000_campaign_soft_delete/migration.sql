-- Keep campaign rows and all related records when a brand deletes a campaign.
ALTER TYPE "CampaignStatus" ADD VALUE IF NOT EXISTS 'DELETED';
