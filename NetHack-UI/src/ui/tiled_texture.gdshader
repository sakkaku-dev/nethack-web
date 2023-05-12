shader_type canvas_item;

uniform vec2 pos;
uniform vec2 tile_count;

void fragment(){
    vec2 newuv = UV;
    newuv += pos / tile_count;
    vec4 c = texture(TEXTURE, newuv);
    COLOR = c;
}