import { getNormalizedRgbaComponents } from '../../../lib/utils.js';
import type { WebGlContextWrapper } from '../../../lib/WebGlContextWrapper.js';
import type { WebGlRenderOpProps } from '../WebGlCoreRenderOp.js';
import {
  BorderTopTemplate,
  type BorderTopProps,
} from '../../../shaders/BorderTopTemplate.js';
import type { WebGlShaderConfig } from '../WebGlShaderProgram.js';

export const BorderTop: WebGlShaderConfig<BorderTopProps> = Object.assign(
  {},
  BorderTopTemplate,
  {
    update(glw: WebGlContextWrapper, renderOp: WebGlRenderOpProps) {
      const props = renderOp.shaderProps as Required<BorderTopProps>;
      glw.uniform1f('u_width', props.width);
      glw.uniform4fv('u_color', getNormalizedRgbaComponents(props.color));
    },
    fragment: `
    # ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    # else
    precision mediump float;
    # endif

    uniform float u_alpha;
    uniform vec2 u_dimensions;
    uniform sampler2D u_texture;

    uniform float u_width;
    uniform vec4 u_color;

    varying vec4 v_color;
    varying vec2 v_textureCoordinate;

    void main() {
      vec4 color = texture2D(u_texture, v_textureCoordinate) * v_color;

      vec2 pos = vec2(0.0, u_width * 0.5);
      vec2 p = v_textureCoordinate.xy * u_dimensions - pos + 1.0;
      vec2 size = vec2(u_dimensions.x, u_width * 0.5) + 1.5;
      vec2 dist = abs(p) - size;
      float shape = min(max(dist.x, dist.y), 0.0) + length(max(dist, 0.0));
      gl_FragColor = mix(color, u_color, clamp(-shape, 0.0, 1.0)) * u_alpha;
    }
  `,
  },
);
