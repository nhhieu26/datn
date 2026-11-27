"use client";

import { useCallback, useMemo, useState } from "react";

/**
 * Quản lý các dòng đang được chọn trong bảng.
 * `selectableIds` là toàn bộ id còn chọn được; id không còn trong danh sách
 * (đã dừng, đã xóa sau khi làm mới) tự động bị loại khỏi lựa chọn.
 */
export function useRowSelection(selectableIds: string[]) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const selectable = useMemo(() => new Set(selectableIds), [selectableIds]);
  const selectedIds = useMemo(
    () => [...selected].filter((id) => selectable.has(id)),
    [selected, selectable],
  );

  const isSelected = useCallback(
    (id: string) => selectable.has(id) && selected.has(id),
    [selected, selectable],
  );

  const toggle = useCallback((id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /** Chọn hoặc bỏ chọn cả một nhóm id (ví dụ các dòng của trang hiện tại). */
  const setGroup = useCallback((ids: string[], checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      for (const id of ids) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);

  const getGroupState = useCallback(
    (ids: string[]) => {
      const count = ids.filter((id) => selected.has(id)).length;
      return {
        checked: ids.length > 0 && count === ids.length,
        indeterminate: count > 0 && count < ids.length,
      };
    },
    [selected],
  );

  return { selectedIds, isSelected, toggle, setGroup, clear, getGroupState };
}
