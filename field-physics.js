// A damped attraction field. Positions and velocities stay independent of rendering.
export class GravityField {
  constructor(bodies) {
    this.bodies = bodies;
    this.accumulator = 0;
  }

  punch(point = { x: 0, y: 0, z: 0 }) {
    for (const body of this.bodies) {
      const radius = Math.max(.01, Math.hypot(body.x, body.y, body.z));
      const dx = body.x - point.x;
      const dy = body.y - point.y;
      const dz = body.z - point.z;
      const distance = Math.max(.01, Math.hypot(dx, dy, dz));
      const localKick = 8 / (1 + distance * .3);
      const outwardKick = 5.5 + body.size * 3;
      body.vx += body.x / radius * outwardKick + dx / distance * localKick;
      body.vy += body.y / radius * outwardKick + dy / distance * localKick;
      body.vz += body.z / radius * outwardKick + dz / distance * localKick;
      body.spin += 3.5;
    }
  }

  advance(delta, { gravity = 1, swirl = .4, pointer = null } = {}) {
    this.accumulator += Math.max(0, Math.min(delta, .05));
    const step = 1 / 120;
    while (this.accumulator >= step) {
      this.accumulator -= step;
      for (const body of this.bodies) {
        const r = Math.max(.001, Math.hypot(body.x, body.y, body.z));
        const pull = -(r - body.radius) * 3.2 * gravity;
        let ax = body.x / r * pull - body.y / r * swirl;
        let ay = body.y / r * pull + body.x / r * swirl;
        let az = body.z / r * pull - (body.z - body.depth) * .5;
        if (pointer) {
          const dx = body.x - pointer.x;
          const dy = body.y - pointer.y;
          const distance = Math.max(.05, Math.hypot(dx, dy));
          if (distance < 1.6) {
            const repulsion = (1 - distance / 1.6) * 12;
            ax += dx / distance * repulsion;
            ay += dy / distance * repulsion;
          }
        }
        const damping = Math.exp(-1.05 * step);
        body.vx = (body.vx + ax * step) * damping;
        body.vy = (body.vy + ay * step) * damping;
        body.vz = (body.vz + az * step) * damping;
        body.x += body.vx * step;
        body.y += body.vy * step;
        body.z += body.vz * step;
        // The center cube has a soft collision boundary, so blocks don't pass through it.
        const distance = Math.hypot(body.x, body.y, body.z);
        const boundary = 1.35 + body.size;
        if (distance < boundary) {
          const nx = distance < .001 ? 1 : body.x / distance;
          const ny = body.y / Math.max(distance, .001);
          const nz = body.z / Math.max(distance, .001);
          body.x = nx * boundary;
          body.y = ny * boundary;
          body.z = nz * boundary;
          const velocity = body.vx * nx + body.vy * ny + body.vz * nz;
          if (velocity < 0) {
            body.vx -= nx * velocity * 1.45;
            body.vy -= ny * velocity * 1.45;
            body.vz -= nz * velocity * 1.45;
          }
        }
        body.spin += (body.baseSpin - body.spin) * Math.min(1, step * 1.8);
        body.rx += body.spin * step;
        body.ry += body.spin * .65 * step;
        body.rz += body.spin * .4 * step;
      }
    }
  }
}
