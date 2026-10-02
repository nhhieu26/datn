import {
  CardBody,
  CardFooter,
  CardFrame,
  CardImage,
  firstImage,
  formatVnd,
  type Money,
} from "./card-parts";

export type DestinationCardData = {
  name: string;
  images: unknown;
  address: string;
  ticketPrice: Money | null;
  province: { name: string };
};

export function DestinationCard({
  destination,
}: {
  destination: DestinationCardData;
}) {
  const hasPrice = destination.ticketPrice != null;

  return (
    <CardFrame>
      <CardImage alt={destination.name} src={firstImage(destination.images)} />
      <CardBody
        chips={[
          { icon: "pin", label: destination.address },
          { icon: "sparkle", label: "Điểm tham quan" },
        ]}
        location={destination.province.name}
        title={destination.name}
      >
        <CardFooter
          label={hasPrice ? "Vé từ" : "Xem chi tiết"}
          price={hasPrice ? formatVnd(destination.ticketPrice!) : null}
          unit="/ người"
        />
      </CardBody>
    </CardFrame>
  );
}
