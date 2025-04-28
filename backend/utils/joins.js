const joins = {
  propertyFields: `
        LEFT JOIN st_current_status cs ON dy.current_status = cs.id
        LEFT JOIN st_prop_type spt ON dy.prop_type_id = spt.id
        LEFT JOIN st_home_type sht ON dy.home_type_id = sht.id
        LEFT JOIN st_prop_desc spd ON dy.prop_desc_id = spd.id
        LEFT JOIN st_community sc ON dy.community_id = sc.id
        LEFT JOIN st_builder sb ON sc.builder_id = sb.id
        LEFT JOIN st_city scity ON sb.city_id = scity.id
        LEFT JOIN st_beds snbe ON dy.no_beds = snbe.id
        LEFT JOIN st_baths snba ON dy.no_baths = snba.id
        LEFT JOIN st_balcony snbc ON dy.no_balconies = snbc.id
        LEFT JOIN st_tenant_eat_pref step ON dy.tenant_eat_pref_id = step.id
        LEFT JOIN st_parking_count spc ON dy.parking_count_id = spc.id
        LEFT JOIN st_maintenance sm ON dy.maintenance_id = sm.id
        LEFT JOIN dy_rm_fm_com_map rm_map ON dy.community_id = rm_map.community_id
        LEFT JOIN dy_user rm_user ON rm_map.rm_id = rm_user.id
        LEFT JOIN st_availability a ON dy.available_date = a.id
        LEFT JOIN st_tenant st ON dy.tenant_type_id = st.id
        LEFT JOIN st_prop_facing spf ON dy.facing = spf.id


    `,
  fieldNames1: `
        dy.id,
        dy.current_status AS current_status_id,
        cs.status_code AS current_status,
        spt.id AS prop_type_id,
        spt.prop_type AS prop_type,
        sht.home_type AS home_type,
        sht.id AS home_type_id,
        spd.prop_desc AS prop_desc,
        spd.id AS prop_desc_id,
        sc.name AS community_name,
        sc.id As community_id,
        sc.map_url AS map_url,
        sc.total_area AS total_area,
        sc.open_area AS open_area,
        sc.nblocks AS nblocks,
        sc.nfloors_per_block AS nfloors_per_block,
        sc.nhouses_per_floor AS nhouses_per_floor,
        sc.address AS address,
        sc.totflats AS totflats,
        sc.uid as default_images,
        snbe.nbeds AS nbeds,
        snba.nbaths AS nbaths,
        snbc.nbalcony AS nbalcony,
        step.eat_pref AS eat_pref,
        step.id AS eat_pref_id,
        st.tenant_type AS tenant_type,
        st.id AS tenant_type_id,
        spc.parking_count AS parking_count,
        sm.id AS maintenance_id,
        sm.maintenance_type AS maintenance_type,
        dy.rental_low,
        dy.rental_high,
        dy.tower_no,
        dy.floor_no,
        dy.flat_no,
        dy.deposit_amount AS deposit_amount,
        dy.uid,
        dy.rec_add_time AS property_added_at,
        dy.rec_last_update_time AS property_updated_at,
        sc.major_area AS majorArea,
        a.available AS available_date,
        a.id AS available_date_id,
        dy.super_area AS super_area,
        dy.carpet_area AS carpet_area,
        sb.name AS builder_name,
        sb.id AS builder_id,
        scity.name AS city_name,
        scity.id AS city_id,
        dy.rec_add_time AS property_added_at,
        rm_user.user_name AS rm_name,
        rm_user.mobile_no AS rm_mobile_no,
        dy.facing AS facing


    `,
};

module.exports = joins;
