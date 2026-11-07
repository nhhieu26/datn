import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { CHAT_MODEL } from "@/features/customer/chat/lib/prompt";
import { buildTripChatTools, tripChatInstructions } from "@/features/customer/trips/lib/trip-ai";
import { canEditTrip, getTrip } from "@/features/customer/trips/lib/trip-service";
import { auth } from "@/lib/auth";
import { vertex } from "@/lib/vertex";

export const maxDuration = 60;

export async function POST(req: Request, ctx: RouteContext<"/api/trips/[id]/chat">) {
  const { id } = await ctx.params;
  const [trip, session] = await Promise.all([getTrip(id), auth()]);
  if (!trip) return Response.json({ error: "Không tìm thấy lộ trình." }, { status: 404 });

  const { messages }: { messages: UIMessage[] } = await req.json();
  const canEdit = canEditTrip(trip.ownerId, session?.user?.id);

  const result = streamText({
    model: vertex(CHAT_MODEL),
    instructions: tripChatInstructions(trip.view, canEdit),
    tools: buildTripChatTools({ tripId: id, canEdit }),
    stopWhen: isStepCount(6),
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
