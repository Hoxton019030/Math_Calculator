from itertools import permutations
from more_itertools import set_partitions

def generate_ordered_tied_rankings(horses):
    result = set()
    for partition in set_partitions(horses):
        # 每個 partition 是無序的群組集合，我們要對群組進行排序
        for group_order in permutations(partition):
            # 對每個 group 內排序，讓相同內容可以去重
            normalized = tuple(tuple(sorted(group)) for group in group_order)
            result.add(normalized)
    return sorted(result)

# 測試
horses = ['A', 'B', 'C', 'D']
rankings = generate_ordered_tied_rankings(horses)

# 顯示結果
for i, ranking in enumerate(rankings, 1):
    display = [f"{i+1}st: {' '.join(group)}" for i, group in enumerate(ranking)]
    print(f"{i}: {ranking}")
