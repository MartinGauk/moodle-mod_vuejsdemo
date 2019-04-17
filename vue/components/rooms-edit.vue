<template>
    <div class="rooms-edit">
        <h3>{{strings.rooms_edit_site_name}}</h3>
        <div class="description">{{strings.rooms_edit_site_description}}</div>
        <ul class="rooms-edit-list">
            <li v-for="room in rooms">
                <div class="room-top-level">
                    {{ room.name }}
                    <router-link :to="{ name: 'room-edit', params: { roomId: room.id }}">
                        <i class="icon fa fa-cog fa-fw iconsmall" :title="strings.edit"></i>
                    </router-link>
                </div>
            </li>
        </ul>
        <div v-if="rooms !== null && rooms.length == 0">
            {{strings.rooms_edit_no_rooms}}
        </div>
        <div class="rooms-edit-add">
            <router-link :to="{ name: 'room-new' }" tag="button" class="btn btn-primary">{{strings.room_form_title_add}}</router-link>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { MFormModal } from '../mform';

    export default {
        name: "rooms-edit",
        data: function() {
            return {
                modal: null,
            };
        },
        computed: mapState(['strings', 'rooms']),
        methods: {
            async showForm(roomId = null) {
                let title = '';
                let args = {};
                if (roomId) {
                    title = this.strings.room_form_title_edit;
                    args.roomid = roomId;
                } else {
                    title = this.strings.room_form_title_add;
                }

                this.modal = new MFormModal('room_edit', title, this.$store.state.contextID, args);
                try {
                    await this.modal.show();
                    const success = await this.modal.finished;
                    if (success) {
                        this.$store.dispatch('fetchRooms');
                    }
                    this.$router.push({name: 'rooms-edit-overview'});
                } catch (e) {
                    // This happens when the modal is destroyed on a page change. Ignore.
                } finally {
                    this.modal = null;
                }
            },
            checkRoute(route) {
                if (this.modal) {
                    this.modal.destroy(false);
                }

                if (route.name === 'room-edit') {
                    this.$nextTick(this.showForm.bind(this, route.params.roomId));
                } else if (route.name === 'room-new') {
                    this.$nextTick(this.showForm.bind(this, null));
                }
            }
        },
        created: function() {
            this.$store.dispatch('fetchRooms');
            this.checkRoute(this.$route);
        },
        beforeRouteUpdate(to, from, next) {
            this.checkRoute(to);
            next();
        },
    }
</script>

<style scoped>
    .rooms-edit-list {
        padding-top: 5px;
    }

    .rooms-edit-add {
        padding-top: 20px;
    }
</style>
