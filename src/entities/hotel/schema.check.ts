import { createHotelSchema } from "./schema";

const base = {
  name: "Test",
  provinceId: "p1",
  address: "addr",
  description: "desc",
  amenities: [] as string[],
  rooms: [
    {
      name: "r",
      description: "d",
      capacity: 2,
      quantity: 1,
      basePrice: 100,
      amenities: [] as string[],
    },
  ],
};

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

const ok = createHotelSchema.safeParse({
  ...base,
  latitude: "16.05",
  longitude: "108.2",
});
assert(ok.success, "toạ độ hợp lệ phải được chấp nhận");
if (ok.success) {
  assert(ok.data.latitude === 16.05, "latitude phải ép về number");
  assert(ok.data.longitude === 108.2, "longitude phải ép về number");
  assert(ok.data.tagIds.length === 0, "tagIds mặc định là mảng rỗng");
}

const withTags = createHotelSchema.safeParse({
  ...base,
  latitude: "16.05",
  longitude: "108.2",
  tagIds: ["t1", "t2"],
});
assert(withTags.success, "tagIds hợp lệ phải được chấp nhận");
if (withTags.success) {
  assert(withTags.data.tagIds.length === 2, "tagIds phải giữ đủ id");
}

const missing = createHotelSchema.safeParse({
  ...base,
  latitude: "",
  longitude: null,
});
assert(!missing.success, "thiếu toạ độ phải bị từ chối (không được coi là 0)");
if (!missing.success) {
  const errors = missing.error.flatten().fieldErrors;
  assert(!!errors.latitude, "phải có lỗi cho latitude");
  assert(!!errors.longitude, "phải có lỗi cho longitude");
}

const outOfRange = createHotelSchema.safeParse({
  ...base,
  latitude: 200,
  longitude: 0,
});
assert(!outOfRange.success, "vĩ độ ngoài khoảng phải bị từ chối");

console.log("schema.check.ts passed");
