import {
  CardBody,
  CardFooter,
  CardFrame,
  CardImage,
  firstImage,
  formatVnd,
  type Money,
} from "./card-parts";

export type TourCardData = {
  title: string;
  images: unknown;
  durationDays: number;
  durationNights: number;
  basePrice: Money;
  province: { name: string };
};

export function TourCard({ tour }: { tour: TourCardData }) {
  return (
    <CardFrame>
      <CardImage alt={tour.title} src={firstImage(tour.images)} />
      <CardBody
        chips={[
          {
            icon: "clock",
            label: `${tour.durationDays} ngày ${tour.durationNights} đêm`,
          },
          { icon: "user", label: "Tour trọn gói" },
        ]}
        location={tour.province.name}
        title={tour.title}
      >
        <CardFooter label="Từ" price={formatVnd(tour.basePrice)} unit="/ khách" />
      </CardBody>
    </CardFrame>
  );
}
