from configs import node_map
from blocks import StripSegment

edges = []
for node_u_idx, node_u in enumerate(node_map):
    # Find closest positive and negative nodes
    for strip_idx, start_idx in enumerate(node_u):
        if start_idx is None:
            continue

        closest_positive_dist = 100000
        closest_negative_dist = 100000
        closest_positive_node = None
        closest_negative_node = None
        closest_positive_pos = None
        closest_negative_pos = None

        for node_v_idx, node_v in enumerate(node_map):
            if node_v_idx == node_u_idx:
                continue
            if node_v[strip_idx] is None:
                continue

            if node_v[strip_idx] > start_idx:
                # It is positive
                current_positive_dist = node_v[strip_idx] - start_idx
                if current_positive_dist < closest_positive_dist:
                    closest_positive_dist = current_positive_dist
                    closest_positive_node = node_v_idx
                    closest_positive_pos = node_v[strip_idx]
            else:
                # It is negative
                current_negative_dist = start_idx - node_v[strip_idx]
                if current_negative_dist < closest_negative_dist:
                    closest_negative_dist = current_negative_dist
                    closest_negative_node = node_v_idx
                    closest_negative_pos = node_v[strip_idx]
        # Append the positive and negative
        if closest_positive_node is not None:
            edges.append(
                StripSegment(
                    strip_idx,
                    start_idx,
                    closest_positive_pos,
                    node_u_idx,
                    closest_positive_node,
                )
            )

        if closest_negative_node is not None:
            edges.append(
                StripSegment(
                    strip_idx,
                    start_idx,
                    closest_negative_pos,
                    node_u_idx,
                    closest_negative_node,
                )
            )


def find_edge(start, end):
    connecting_segment = None
    for edge in edges:
        if edge.start_node == start and edge.end_node == end:
            connecting_segment = edge
            break
    return connecting_segment


def shortest_path(start, end):
    dist = [1000000 for _ in node_map]
    prev = [None for _ in node_map]
    Q = [i for i, _ in enumerate(node_map)]

    dist[start] = 0

    while len(Q) > 0:
        dists_in_Q = [(u, dist[u]) for u in Q]
        min_dist = dists_in_Q[0][1]
        u = dists_in_Q[0][0]
        for cur_u, cur_dist in dists_in_Q[1:]:
            if cur_dist < min_dist:
                min_dist = cur_dist
                u = cur_u

        Q.remove(u)

        if u == end:
            break

        for v in Q:
            connection = find_edge(u, v)
            if connection is None:
                continue
            alt = dist[u] + abs(connection.start_idx - connection.end_idx)
            if alt < dist[v]:
                dist[v] = alt
                prev[v] = u

    # Here we repeat
    path = []
    u = end
    while u is not None:
        path.insert(0, u)
        u = prev[u]
    return path
    # Otherwise it is neighbor


def path_to_segments(path) -> list[StripSegment]:
    segments = []
    for i, node in enumerate(path):
        if i == len(path) - 1:
            break
        segments.append(find_edge(node, path[i + 1]))
    return segments


def get_segments(start, end) -> list[StripSegment]:
    return path_to_segments(shortest_path(start, end))
