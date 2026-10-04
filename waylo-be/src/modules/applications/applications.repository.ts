import {prisma} from "../../lib/prisma";
import type {Prisma} from "@prisma/client";

type Tx = Prisma.TransactionClient;

const detailInclude = {
  job: {include: {company: true}},
  candidate: true,
  stageHistory: {orderBy: {occurredAt: "asc"}},
} satisfies Prisma.ApplicationInclude;

export type ApplicationListRow = Prisma.ApplicationGetPayload<{
  include: {job: true; candidate: true};
}>;

export type ApplicationDetailRow = Prisma.ApplicationGetPayload<{
  include: typeof detailInclude;
}>;

export const applicationRepository = {
  listByCompany(companyId: string, jobId?: string): Promise<ApplicationListRow[]> {
    return prisma.application.findMany({
      where: {
        job: {companyId},
        ...(jobId ? {jobId} : {}),
      },
      orderBy: {updatedAt: "desc"},
      include: {job: true, candidate: true},
    });
  },

  findById(id: string): Promise<ApplicationDetailRow | null> {
    return prisma.application.findUnique({
      where: {id},
      include: detailInclude,
    });
  },

  advance(
    id: string,
    stage: Prisma.ApplicationUpdateInput["stage"],
    actor: string,
    note: string | null,
  ): Promise<ApplicationDetailRow> {
    return prisma.$transaction(async (tx: Tx) => {
      return tx.application.update({
        where: {id},
        data: {
          stage,
          stageHistory: {create: {stage: stage as never, actor, note}},
        },
        include: detailInclude,
      });
    });
  },
};