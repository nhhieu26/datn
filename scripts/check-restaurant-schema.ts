import assert from "node:assert";
import { createRestaurantSchema } from "../src/entities/restaurant/schema";

const valid = {
  name: "Nhà hàng Biển Đông",
  provinceId: "p1",
  address: "123 Trần Phú",
  phone: "",
  capacity: "120",
  description: "",
  tagIds: ["t1"],
  menu: [{ name: "Tôm hùm", description: "", price: "350000" }],
  timeSlots: [{ startTime: "09:00", endTime: "22:00" }],
};

const ok = createRestaurantSchema.safeParse(valid);
assert.ok(ok.success, "dữ liệu hợp lệ phải pass");
assert.strictEqual(ok.data.capacity, 120, "capacity phải coerce sang number");
assert.strictEqual(ok.data.phone, null, "phone rỗng phải thành null");
assert.strictEqual(ok.data.menu[0].price, 350000, "price phải coerce");

const dup = createRestaurantSchema.safeParse({
  ...valid,
  timeSlots: [
    { startTime: "09:00", endTime: "12:00" },
    { startTime: "09:00", endTime: "22:00" },
  ],
});
assert.ok(!dup.success, "trùng giờ bắt đầu phải fail");

const badRange = createRestaurantSchema.safeParse({
  ...valid,
  timeSlots: [{ startTime: "22:00", endTime: "09:00" }],
});
assert.ok(!badRange.success, "giờ kết thúc trước giờ bắt đầu phải fail");

const badTime = createRestaurantSchema.safeParse({
  ...valid,
  timeSlots: [{ startTime: "25:00", endTime: "26:00" }],
});
assert.ok(!badTime.success, "giờ không hợp lệ phải fail");

const emptyMenu = createRestaurantSchema.safeParse({ ...valid, menu: [] });
assert.ok(!emptyMenu.success, "menu rỗng phải fail");

console.log("✓ createRestaurantSchema self-check passed");
